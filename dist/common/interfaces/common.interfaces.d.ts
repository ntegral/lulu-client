import * as rp from 'request-promise';
import * as request from 'request';
export interface IAuthenticationResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: 'bearer' | 'access_token';
    not_before_policy?: number;
    session_state?: string;
    scope?: string | string[];
}
export interface JwtDecodedResponse {
    header: JwtHeader;
    payload: JwtPayload;
    signature: string;
}
export interface JwtHeader {
    alg: string;
    typ: string;
    kid: string;
}
export interface JwtPayload {
    jti: string;
    exp: number;
    nbf: number;
    iat: number;
    iss: string;
    aud: string[];
    sub: string;
    typ: string;
    azp: string;
    auth_time: number;
    session_state: string;
    acr: string;
    realm_access: any;
    resource_access: any;
    scope: string;
    clientHost: string;
    clientId: string;
    email_verified: boolean;
    groups: string[];
    preferred_username: string;
    clientAddress: string;
    email: string;
}
export interface IList<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];
}
interface IResponseError {
    error: string;
    error_description: string;
}
export interface ILuluAuthenticationError {
    name: string;
    statusCode: number;
    message: string;
    error: IResponseError;
    options: rp.OptionsWithUri;
    response: request.Response;
}
export {};
