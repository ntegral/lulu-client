import * as rp from 'request-promise';
import { LuluConfigOptions, JwtPayload } from './common/interfaces/index';
import { IAuthenticationResponse } from './common/interfaces/index';
export declare class Client {
    private config;
    private tokenKey;
    private client_id;
    private client_secret;
    private decoded;
    private defaultHeaders;
    private defaultRequest;
    private isAuthenticated;
    private sandbox;
    private prod;
    private tokenUrl;
    private url;
    private exp;
    private token;
    constructor(config: LuluConfigOptions);
    init(): Promise<IAuthenticationResponse>;
    getToken(refresh?: boolean): Promise<IAuthenticationResponse>;
    decode(data: IAuthenticationResponse): Promise<JwtPayload>;
    refreshToken(data: IAuthenticationResponse): Promise<IAuthenticationResponse>;
    request(data: rp.OptionsWithUri): Promise<any>;
    private createHeaders;
    private createRequest;
    private handleError;
    private mergeData;
}
