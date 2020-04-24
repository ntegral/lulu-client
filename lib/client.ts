import * as request from 'request';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import { LuluConfigOptions, LuluApiCredConfigOption, JwtPayload } from './common/interfaces/index';
import { IAuthenticationResponse, LuluApiKeyConfigOption } from './common/interfaces/index';

export class Client {
    private tokenKey!: string;
    private client_id!: string;
    private client_secret!: string;
    private decoded: JwtPayload;
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

    constructor(private config: LuluConfigOptions) {
        if (config.hasOwnProperty('token')) {
             const ctx = config as (LuluApiKeyConfigOption);
             this.tokenKey = ctx.token;
        } else {
            const ctx = config as (LuluApiCredConfigOption);
            this.client_id = ctx.client_key;
            this.client_secret = ctx.client_secret;
        }
        this.isAuthenticated = false;
        this.decoded = {} as JwtPayload;
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
                let now = moment();
                if (!this.isAuthenticated) {
                    let result = await this.getToken();
                    // console.log('roll on 1');
                    this.token = result;
                    resolve(result);
                }
                else if (this.isAuthenticated && this.decoded && now.isSameOrBefore(moment.unix(+this.decoded.exp).subtract(30,'minutes'))) {
                    // console.log('roll on 2');
                    let expiry = moment.unix(+this.decoded.exp).toLocaleString();
                    let result = this.token;
                    resolve(result);
                }
                else if (this.isAuthenticated && this.decoded && now.isSameOrAfter(moment.unix(+this.decoded.exp).subtract(30,'minutes')) && now.isBefore(moment.unix(+this.decoded.exp).subtract(10,'minutes'))) {
                    // console.log('roll on 3')
                    let result = await this.refreshToken(this.token);
                    this.token = result;
                    resolve(result);
                }
                else {
                    // console.log('roll on 4')
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
     * @param { boolean } refresh - the
     * @returns IAuthenticationResponse
     */
    getToken(refresh?:boolean): Promise<IAuthenticationResponse> {
        let opts: rp.RequestPromiseOptions = {
            method: 'POST',
            json: true,
        };
        if (this.config.hasOwnProperty('token')) {
            const ctx = this.config as (LuluApiKeyConfigOption);
            opts.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${ctx.token}`
            };
            opts.form = {
                grant_type: 'client_credentials'
            };

        } else {
            const ctx = this.config as (LuluApiCredConfigOption);
            opts.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            opts.form = {
                grant_type: 'client_credentials',
                client_id: ctx.client_key,
                client_secret: ctx.client_secret
            };
        }

        return new Promise((resolve, reject) => {
            rp(this.url, opts).then(async(result: IAuthenticationResponse) => {
                if (result.access_token) {
                    this.token = this.mergeData(result,this.token);
                    this.decoded = await this.decode(result);
                    this.isAuthenticated = true;
                    resolve(result);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * @param { IAuthenticationResponse } data - the authentication response
     * @returns Promise<JwtPayload>
     */
    decode(data: IAuthenticationResponse): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            try {
                const _decoded: JwtPayload = jwt.decode(data.access_token, { json: true }) as JwtPayload;
                this.exp = +_decoded.exp;
                resolve(_decoded);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * @param { IAuthenticationResponse } data - the authentication response with a valid refresh token
     * @returns Promise<IAuthenticationResponse>
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
            rp(this.url, opts).then(async(result:IAuthenticationResponse) => {
                if (result.access_token) {
                    this.token = this.mergeData(result,this.token);
                    this.decoded = await this.decode(result);
                    this.isAuthenticated = true;
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
        return await this.createRequest(data);
    }

    private createHeaders(data: any) {
        // merge data with default headers
        const headers = this.mergeData(this.defaultHeaders, data);

        // add API key, but don't overwrite if header already set
        // handled in the authorization and of getToken or refreshToken
        if (typeof (<request.Headers>headers).Authorization === 'undefined' && this.token) {
            (<request.Headers>headers).Authorization = 'Bearer ' + this.token.access_token;
        }
        // return
        return headers;
    }

    /**
     * 
     * @param { rp.OptionsWithUri } data - the request-promise options with uri
     * @returns Promise<any>
     */
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
