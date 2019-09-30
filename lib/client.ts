import * as request from 'request';
import * as rp from 'request-promise';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import { LuluConfigOptions } from './common/interfaces/index';
import { IAuthenticationResponse } from './common/interfaces/index'

export class Client {
    private client_id!: string;
    private client_secret!: string;
    private decoded!: any;
    private defaultHeaders: request.Headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
    };
    private defaultRequest: rp.OptionsWithUri = {
        json: true,
        uri: '',
        headers: {},
    };
    private isAuthenticated: boolean = false;
    private initialization!: Promise<any>;
    private sandbox: string = 'https://api.sandbox.lulu.com';
    private prod: string = 'https://api.lulu.com';
    private tokenUrl: string = 'auth/realms/glasstree/protocol/openid-connect/token';
    private url: string = '';

    constructor(config: LuluConfigOptions) {
        this.client_id = config.client_key;
        this.client_secret = config.client_secret;
        if (config.environment == 'production') {
            this.defaultRequest.baseUrl = this.prod;
            this.url = `${this.prod}/${this.tokenUrl}`;
        } else {
            this.defaultRequest.baseUrl = this.sandbox;
            this.url = `${this.sandbox}/${this.tokenUrl}`;
        }
        this.initialization = this.init();
    }

    init = async () => {
        try {
            let now = moment();
            if (!this.isAuthenticated) {
                let result = await this.getToken();
                return result;
            }
            if (this.isAuthenticated && this.decoded && !moment.unix(this.decoded.payload.exp).isAfter(now.add(10,'minutes'))) {
                let result = await this.refreshToken(this.decoded)
            }
        } catch (error) {
            throw new TypeError('Unable to initiate due to \n' + error);
        }
    }

    /**
     * 
     * @param { IAuthenticationResponse } data - the authentication response from lulu
     * @returns request headers
     */
    authorizeHeader(data: IAuthenticationResponse) {
        // merge access token with default headers
        const headers = this.defaultHeaders;

        // let decoded: any = jwt.decode(data.access_token, { complete: true });
        this.decoded = jwt.decode(data.access_token, { complete: true });

        if (typeof headers.Authorization === 'undefined') {
            headers.Authorization = 'Bearer ' + data.access_token;
        }
        // add access_token, but don't overwrite if header already set
        return headers;
    }

    /**
     * @returns IAuthenticationResponse
     */
    async getToken() {
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

        let result = await rp(this.url, opts).catch((this.handleError));

        if (result.access_token) {
            console.log('authentication successful', result.token_type);
            this.authorizeHeader(result);
            this.isAuthenticated = true;
        }

        return result;
    }

    /**
     * @returns IAuthenticationResponse
     */
    async refreshToken(data: IAuthenticationResponse) {
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

        let result = await rp(this.url, opts).catch((this.handleError));

        if (result.access_token) {
            console.log('refresh_token successful', result.token_type);
            this.authorizeHeader(result);
            this.isAuthenticated = true;
        }

        return result;
    }

    /**
     * 
     * @param { rp.OptionsWithUri } data - the request-promise options with uri
     * @returns rp.RequestPromise
     */
    async request(data: rp.OptionsWithUri) {
        await this.initialization;
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
