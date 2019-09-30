import { IList } from "./interfaces";
import { Client } from "../client";
export declare namespace resource {
    type TitleOptions = "MR" | "MISS" | "MRS" | "MS" | "DR";
    type ShippingOption = 'MAIL' | 'PRIORITY_MAIL' | 'GROUND_HD' | 'GROUND_BUS' | 'GROUND' | 'EXPEDITED' | 'EXPRESS';
    interface IShippingAddress {
        city: string;
        country_code: string;
        email?: string;
        is_business: boolean;
        name?: string;
        organization?: string;
        phone_number?: string;
        postal_code: string;
        state_code?: string;
        street1: string;
        street2: string;
        title: TitleOptions;
    }
    interface IPaging {
        page: number;
        page_size: number;
    }
    interface ShippingListOptions extends IPaging {
        iso_country_code?: string;
        currency?: string;
        quantity?: string;
        pod_package_id?: string;
        state_code?: string;
        level?: any;
        postbox_ok?: boolean;
        fastest_per_level?: boolean;
    }
    interface IShippingOptions {
        list(params: ShippingListOptions): Promise<IList<ShippingOption>>;
    }
    class ShippingOptions implements IShippingOptions {
        private client;
        constructor(client: Client);
        list(params: ShippingListOptions): Promise<IList<ShippingOption>>;
    }
}
