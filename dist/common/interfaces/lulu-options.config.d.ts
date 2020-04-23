export declare type LuluConfigEnvironment = 'development' | 'production';
export interface LuluApiKeyConfigOption {
    token: string;
    environment: LuluConfigEnvironment;
}
export interface LuluApiCredConfigOption {
    client_key: string;
    client_secret: string;
    environment: LuluConfigEnvironment;
}
export declare type LuluConfigOptions = LuluApiKeyConfigOption | LuluApiCredConfigOption;
