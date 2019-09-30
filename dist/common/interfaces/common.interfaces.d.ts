import * as rp from 'request-promise';
import * as request from 'request';
import { resource } from '../common.resource';
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
export interface ShippingOption {
    business_only: boolean;
    cost_excl_tax: string;
    currency: string;
    home_only: boolean;
    id: number;
    level: resource.ShippingOption;
    max_delivery_date: string;
    max_dispatch_date: string;
    min_delivery_date: string;
    min_dispatch_date: string;
    postbox_ok: boolean;
    shipping_buffer: number;
    total_days_max: number;
    total_day_min: number;
    traceable: boolean;
    transit_time: number;
}
export {};
