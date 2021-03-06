"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rp = require("request-promise");
const jwt = require("jsonwebtoken");
const moment = require("moment");
class Client {
    constructor(config) {
        this.config = config;
        this.defaultHeaders = {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
        };
        this.defaultRequest = {
            json: true,
            uri: '',
            headers: {},
        };
        this.sandbox = 'https://api.sandbox.lulu.com';
        this.prod = 'https://api.lulu.com';
        this.tokenUrl = 'auth/realms/glasstree/protocol/openid-connect/token';
        this.url = '';
        this.exp = 0;
        if (config.hasOwnProperty('token')) {
            const ctx = config;
            this.tokenKey = ctx.token;
        }
        else {
            const ctx = config;
            this.client_id = ctx.client_key;
            this.client_secret = ctx.client_secret;
        }
        this.isAuthenticated = false;
        this.decoded = {};
        this.token = {};
        if (config.environment == 'production') {
            this.defaultRequest.baseUrl = this.prod;
            this.url = `${this.prod}/${this.tokenUrl}`;
        }
        else {
            this.defaultRequest.baseUrl = this.sandbox;
            this.url = `${this.sandbox}/${this.tokenUrl}`;
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let now = moment();
                    if (!this.isAuthenticated) {
                        let result = yield this.getToken();
                        this.token = result;
                        resolve(result);
                    }
                    else if (this.isAuthenticated && this.decoded && now.isSameOrBefore(moment.unix(+this.decoded.exp).subtract(30, 'minutes'))) {
                        let expiry = moment.unix(+this.decoded.exp).toLocaleString();
                        let result = this.token;
                        resolve(result);
                    }
                    else if (this.isAuthenticated && this.decoded && now.isSameOrAfter(moment.unix(+this.decoded.exp).subtract(30, 'minutes')) && now.isBefore(moment.unix(+this.decoded.exp).subtract(10, 'minutes'))) {
                        let result = yield this.refreshToken(this.token);
                        this.token = result;
                        resolve(result);
                    }
                    else {
                        let result = yield this.getToken();
                        this.token = result;
                        resolve(result);
                    }
                }
                catch (error) {
                    reject(`Unable to initiate due to \n' + ${error}`);
                }
            }));
        });
    }
    getToken(refresh) {
        let opts = {
            method: 'POST',
            json: true,
        };
        if (this.config.hasOwnProperty('token')) {
            const ctx = this.config;
            opts.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${ctx.token}`
            };
            opts.form = {
                grant_type: 'client_credentials'
            };
        }
        else {
            const ctx = this.config;
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
            rp(this.url, opts).then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result.access_token) {
                    this.token = this.mergeData(result, this.token);
                    this.decoded = yield this.decode(result);
                    this.isAuthenticated = true;
                    resolve(result);
                }
            })).catch((err) => {
                reject(err);
            });
        });
    }
    decode(data) {
        return new Promise((resolve, reject) => {
            try {
                const _decoded = jwt.decode(data.access_token, { json: true });
                this.exp = +_decoded.exp;
                resolve(_decoded);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    refreshToken(data) {
        let opts = {
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
            rp(this.url, opts).then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result.access_token) {
                    this.token = this.mergeData(result, this.token);
                    this.decoded = yield this.decode(result);
                    this.isAuthenticated = true;
                    resolve(result);
                }
            })).catch((err) => {
                reject(err);
            });
        });
    }
    request(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = yield this.init();
            return yield this.createRequest(data);
        });
    }
    createHeaders(data) {
        const headers = this.mergeData(this.defaultHeaders, data);
        if (typeof headers.Authorization === 'undefined' && this.token) {
            headers.Authorization = 'Bearer ' + this.token.access_token;
        }
        return headers;
    }
    createRequest(data) {
        let request = this.mergeData(this.defaultRequest, data);
        request.headers = this.createHeaders(request.headers);
        return new Promise((resolve, reject) => {
            rp(request).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    handleError(error) {
        if (error.error) {
            console.log('Lulu API::handleError', error.error);
        }
        return new Promise((reject) => {
            this.isAuthenticated = false;
            reject(error);
        });
    }
    mergeData(base, data) {
        if (typeof base !== 'object' || base === null) {
            throw new Error('not an object provided for base');
        }
        if (typeof data !== 'object' || data === null) {
            throw new Error('not an object provided for data');
        }
        const merged = Object.assign({}, base);
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (data[key] && Array.isArray(data[key])) {
                    merged[key] = data[key];
                }
                else if (data[key] && typeof data[key] === 'object') {
                    merged[key] = Object.assign({}, data[key]);
                }
                else {
                    merged[key] = data[key];
                }
            }
        }
        return merged;
    }
}
exports.Client = Client;
