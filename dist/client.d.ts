import * as request from 'request';
import * as rp from 'request-promise';
import { LuluConfigOptions } from './common/interfaces/index';
import { IAuthenticationResponse } from './common/interfaces/index';
export declare class Client {
    client_id: string;
    client_secret: string;
    private decoded;
    private defaultHeaders;
    private defaultRequest;
    private isAuthenticated;
    private initialization;
    private sandbox;
    private prod;
    private tokenUrl;
    private url;
    constructor(config: LuluConfigOptions);
    init: () => Promise<any>;
    authorizeHeader(data: IAuthenticationResponse): request.Headers;
    getToken(): Promise<any>;
    refreshToken(data: IAuthenticationResponse): Promise<any>;
    request(data: rp.OptionsWithUri): Promise<any>;
    private createHeaders;
    private createRequest;
    private handleError;
    private mergeData;
}
