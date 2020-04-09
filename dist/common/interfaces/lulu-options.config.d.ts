export declare type LuluConfigEnvironment = 'development' | 'production';
export interface LuluConfigOptions {
    client_key: string;
    client_secret: string;
    environment: LuluConfigEnvironment;
}
