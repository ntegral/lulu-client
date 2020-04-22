import * as request from 'request';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import { LuluConfigOptions, JwtDecodedResponse } from './common/interfaces/index';
import { IAuthenticationResponse } from './common/interfaces/index'

export class Client {
    private clock: moment.Moment;
    private client_id!: string;
    private client_secret!: string;
    private decoded: JwtDecodedResponse;
    private defaultHeaders: request.Headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
    };
    private defaultRequest: rp.OptionsWithUri = {
        json: true,
        uri: '',
        headers: {},
    };
    private isAuthenticated:boolean;
    // private initialization!: Promise<any>;
    private sandbox: string = 'https://api.sandbox.lulu.com';
    private prod: string = 'https://api.lulu.com';
    private tokenUrl: string = 'auth/realms/glasstree/protocol/openid-connect/token';
    private url: string = '';
    private exp: number = 0;
    private token: IAuthenticationResponse;

    constructor(config: LuluConfigOptions) {
        this.isAuthenticated = false;
        this.client_id = config.client_key;
        this.client_secret = config.client_secret;
        this.decoded = {} as JwtDecodedResponse;
        this.token = {} as IAuthenticationResponse;
        this.clock = moment();
        console.log('clock', this.clock);

        if (config.environment == 'production') {
            this.defaultRequest.baseUrl = this.prod;
            this.url = `${this.prod}/${this.tokenUrl}`;
        } else {
            this.defaultRequest.baseUrl = this.sandbox;
            this.url = `${this.sandbox}/${this.tokenUrl}`;
        }
        // this.initialization = this.init();
    }

    init(): Promise<IAuthenticationResponse> {

        return new Promise(async(resolve, reject) => {
            try {
                let now = moment();
                if (!this.isAuthenticated) {
                    let result = await this.getToken();
                    console.log('init...');
                    this.token = result;
                    // return result;
                    resolve(result);
                }
                if (this.isAuthenticated && this.decoded && now.isSameOrAfter(this.clock.add(60,'seconds'))) {
                    let result = await this.refreshToken(this.token);
                    console.log('refreshing token...');
                    // return result;
                    resolve(result);
                }
                /* if (this.isAuthenticated && this.decoded && !moment.unix(+this.decoded.payload.exp).isAfter(now.add(10,'minutes'))) { // token hasn't expired renew //
                    let result = await this.refreshToken(this.token);
                    // console.log('using of refreshToken');
                    // return result;
                    resolve(result);
                } */
                if (this.isAuthenticated && this.decoded && moment.unix(+this.decoded.payload.exp).isAfter(now)) { // token has expired, get a new token //
                    let result = await this.getToken();
                    this.token = result;
                    console.log('renewing token...');
                    // return result;
                    resolve(result);
                }
            } catch (error) {
                // throw new TypeError('Unable to initiate due to \n' + error);
                reject(`Unable to initiate due to \n' + ${error}`);
            }
        })
    }

    /**
     * 
     * @param { IAuthenticationResponse } data - the authentication response from lulu
     * @returns request headers
     */
    async authorizeHeader(data: IAuthenticationResponse) {
        // merge access token with default headers
        const headers = this.defaultHeaders;

        return new Promise(async(resolve, reject) => {
            try {
                // data.
                this.decoded = jwt.decode(data.access_token, {json: true , complete:true}) as JwtDecodedResponse;
                // console.log('jwt decoded', this.decoded);
                this.exp = this.decoded.payload.exp;
                console.log('exp',this.exp);
                let expiry = moment.unix(+this.exp).toLocaleString();
                console.log('expiry',expiry);
                this.isAuthenticated = true;

                if (typeof headers.Authorization === 'undefined') {
                    headers.Authorization = 'Bearer ' + data.access_token;
                }
                // add access_token, but don't overwrite if header already set

            } catch (err) {
                console.log('signature has expired', err);
                // await this.getToken();
                // reject(err);
            }
            resolve(headers);
        })

        // let decoded: any = jwt.decode(data.access_token, { complete: true });
        // try {
        //     this.decoded = jwt.decode(data.access_token, { complete: true }) as JwtDecodedResponse;
        //     console.log('jwt decoded', this.decoded);
        //     this.exp = this.decoded.payload.exp;
        //     let expiry = moment.unix(this.exp).toDate().toLocaleString();
        //     console.log('expiry',expiry);
        //     this.isAuthenticated = true;
        // } catch (err) {
        //     console.log('signature has expired', err);
        //     await this.getToken();
        // }
        // console.log('expire', moment.unix(this.decoded.payload.exp));

        /* if (typeof headers.Authorization === 'undefined') {
            headers.Authorization = 'Bearer ' + data.access_token;
        } */
        // add access_token, but don't overwrite if header already set
        // return headers;
    }

    /**
     * @returns IAuthenticationResponse
     */
    getToken(): Promise<IAuthenticationResponse> {
        let opts: rp.RequestPromiseOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                grant_type: 'client_credentials',
                client_id: this.client_id,
                client_secret: this.client_secret,
            },
            json: true,
        };

        return rp(this.url, opts).then(async(result: IAuthenticationResponse) => {
            if (result.access_token) {
                // console.log('authentication successful', result.token_type);
                await this.authorizeHeader(result);
                // this.isAuthenticated = true;
            }
            return result;

        }).catch(this.handleError);
    }

    /**
     * @returns IAuthenticationResponse
     */
    refreshToken(data: IAuthenticationResponse): Promise<IAuthenticationResponse> {
        let opts: rp.RequestPromiseOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                grant_type: 'refresh_token',
                client_id: this.client_id,
                client_secret: this.client_secret,
                refresh_token: data.refresh_token,
            },
            json: true,
        };

        return rp(this.url, opts).then(async(result:IAuthenticationResponse) => {
            if (result.access_token) {
                // console.log('authentication successful', result.token_type);
                await this.authorizeHeader(result);
                // this.isAuthenticated = true;
            }
            return result;

        }).catch(this.handleError);
    }

    /**
     * 
     * @param { rp.OptionsWithUri } data - the request-promise options with uri
     * @returns rp.RequestPromise
     */
    async request(data: rp.OptionsWithUri) {
        // await this.initialization;
        let status = await this.init();
        console.log('status of request', status);
        return this.createRequest(data);
    }

    private createHeaders(data: any) {
        // merge data with default headers
        const headers = this.mergeData(this.defaultHeaders, data);

        // add API key, but don't overwrite if header already set
        if (typeof (<request.Headers>headers).Authorization === 'undefined') {
            (<request.Headers>headers).Authorization = 'Bearer ' + data.access_token;
        }
        // return
        return headers;
    }

    private createRequest(data: rp.OptionsWithUri): rp.RequestPromise {
        // merge data with empty request //
        let request: rp.OptionsWithUri = this.mergeData(this.defaultRequest, data);
        // console.log('authenticated', this.isAuthenticated);
        // add headers //
        request.headers = this.createHeaders(request.headers);
        return rp(request);
    }

    private handleError(error: any) {
        if (error.error) {
            console.log('Lulu API::handleError', error.error);
        }
        return new Promise((reject) => {
            this.isAuthenticated = false;
            reject(error);
        });
    }

    private mergeData(base: any, data: any) {
        if (typeof base !== 'object' || base === null) {
            throw new Error('not an object provided for base');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('not an object provided for data');
        }

        // copy base
        const merged = Object.assign({}, base);

        // add data
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] && Array.isArray(data[key])) {
                    merged[key] = data[key];
                } else if (data[key] && typeof data[key] === 'object') {
                    merged[key] = Object.assign({}, data[key]);
                } else {
                    merged[key] = data[key];
                }
            }
        }
        return merged;
    }
}
