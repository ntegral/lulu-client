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
