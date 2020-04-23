import * as request from 'request';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import { LuluConfigOptions, JwtDecodedResponse } from './common/interfaces/index';
import { IAuthenticationResponse } from './common/interfaces/index'

export class Client {
    private clock!: moment.Moment;
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

        if (config.environment == 'production') {
            this.defaultRequest.baseUrl = this.prod;
            this.url = `${this.prod}/${this.tokenUrl}`;
        } else {
            this.defaultRequest.baseUrl = this.sandbox;
            this.url = `${this.sandbox}/${this.tokenUrl}`;
        }
    }

    async init(): Promise<IAuthenticationResponse> {

        return new Promise(async(resolve, reject) => {
            try {
                this.clock = moment();
                let now = moment();
                if (!this.isAuthenticated) {
                    let result = await this.getToken();
                    this.token = result;

                    resolve(result);
                }
                if (this.isAuthenticated && this.decoded && now.isSameOrBefore(moment.unix(+this.decoded.payload.exp).subtract(15,'minutes'))) {
                    let expiry = moment.unix(+this.decoded.payload.exp).toLocaleString();
                    let result = this.token;// await this.refreshToken(this.token);
                    resolve(result);
                }
                if (this.isAuthenticated && this.decoded && now.isSameOrAfter(moment.unix(+this.decoded.payload.exp).subtract(15,'minutes'))) {
                    let result = await this.getToken();
                    this.token = result;
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
                this.decoded = jwt.decode(data.access_token, {json: true , complete:true}) as JwtDecodedResponse;

                this.exp = this.decoded.payload.exp;
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
        });
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

        return new Promise((resolve, reject) => {
            rp(this.url, opts).then(async(result) => {
                if (result.access_token) {
                    await this.authorizeHeader(result);
                    resolve(result);
                }
            }).catch((err) => {
                reject(err);
            })
        });
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

        return new Promise((resolve, reject) => {
            rp(this.url, opts).then(async(result) => {
                if (result.access_token) {
                    await this.authorizeHeader(result);
                    resolve(result);
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }

    /**
     * 
     * @param { rp.OptionsWithUri } data - the request-promise options with uri
     * @returns rp.RequestPromise
     */
    async request(data: rp.OptionsWithUri): Promise<any> {
        let status = await this.init();
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

    private createRequest(data: rp.OptionsWithUri): Promise<any> {
        // merge data with empty request //
        let request: rp.OptionsWithUri = this.mergeData(this.defaultRequest, data);
        // add headers //
        request.headers = this.createHeaders(request.headers);

        return new Promise((resolve, reject) => {
            rp(request).then((result) => {
                resolve(result);
            }).catch((error)=> {
                reject(error);
            })
        });
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
