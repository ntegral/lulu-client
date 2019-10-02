import { IList } from "./interfaces";
import { Client } from "../client";
export declare namespace resource {
    type TitleOptions = "MR" | "MISS" | "MRS" | "MS" | "DR";
    type ShippingLevel = 'MAIL' | 'PRIORITY_MAIL' | 'GROUND_HD' | 'GROUND_BUS' | 'GROUND' | 'EXPEDITED' | 'EXPRESS';
    interface ShippingAddress {
        city: string;
        country_code: string;
        email: string;
        is_business: boolean;
        name: string;
        organization?: string;
        phone_number: string;
        postalcode: string;
        state_code?: string;
        street1: string;
        street2?: string;
        title: TitleOptions;
    }
    interface IPaging {
        page: number;
        page_size: number;
    }
    interface Discount {
        amount: string;
        description: string;
    }
    interface ShippingListOptions extends IPaging {
        iso_country_code?: string;
        currency?: string;
        quantity?: string;
        pod_package_id?: string;
        state_code?: string;
        level?: ShippingLevel;
        postbox_ok?: boolean;
        fastest_per_level?: boolean;
    }
    interface ShippingOption {
        business_only: boolean;
        cost_excl_tax: string;
        currency: string;
        home_only: boolean;
        id: number;
        level: ShippingLevel;
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
    interface IShippingOptions {
        list(params: ShippingListOptions): Promise<IList<ShippingOption>>;
    }
    class ShippingOptions implements IShippingOptions {
        private client;
        constructor(client: Client);
        list(params: ShippingListOptions): Promise<IList<ShippingOption>>;
    }
    interface PrintJobListOptions extends IPaging {
        created_after?: string;
        created_before?: string;
        modified_after?: string;
        modified_before?: string;
        id?: string;
        order_id?: string;
        exclude_line_items?: boolean;
        search?: string;
        ordering?: string;
    }
    interface PrintJobStatisticsOptions extends IPaging {
        created_after?: string;
        created_before?: string;
        modified_after?: string;
        modified_before?: string;
        id?: string;
        ordering?: string;
    }
    interface PrintJobEstimateItem {
        page_count: number;
        pod_package_id: string;
        quantity: number;
    }
    interface PrintJobCalculationOptions {
        line_items: PrintJobEstimateItem[];
        shipping_address: ShippingAddress;
        shipping_option: ShippingLevel;
    }
    interface EstimatedShippingDates {
        arrival_max: string;
        arrival_min: string;
        dispatch_max: string;
        dispatch_min: string;
    }
    interface LineItemCost {
        cost_excl_discounts: string;
        discounts: Discount[];
        quantity: number;
        tax_rate: string;
        total_cost_excl_discounts: string;
        total_cost_excl_tax: string;
        total_cost_incl_tax: string;
        total_tax: string;
        unit_tier_cost: string;
    }
    interface ShippingCost {
        tax_rate: string;
        total_cost_excl_tax: string;
        total_cost_incl_tax: string;
        total_tax: string;
    }
    interface Message {
        delay: string;
        error: string;
        info: string;
        printable_normalization: PrintableNormalization;
        timestamp: string;
        url: string | string[];
    }
    interface File {
        file_id: number;
        filename: string;
    }
    interface Cover extends PrintableItem {
    }
    interface Interior extends PrintableItem {
    }
    interface PrintableItem {
        job_id: number;
        normalized_file: File;
        page_count: number;
        source_file: File;
        source_md5sum: string;
        source_url: string;
    }
    interface PrintableNormalization {
        cover: string[];
        interior: string[];
        pod_package_id: string;
    }
    interface Status {
        changed?: string;
        messages: string | Message;
        name: "CREATED" | "ACCEPTED" | "REJECTED" | "IN_PRODUCTION" | "ERROR" | "SHIPPED";
    }
    interface Printable {
        external_id: string;
        id: number;
        page_count?: number;
        pod_package_id?: string;
        printable_id: string;
        printable_normalization: PrintableNormalization;
        quantity: number;
        status: Status;
        title: string;
        tracking_id?: string;
        tracking_urls?: string[];
        reprint?: Reprint;
    }
    interface JobStatistics {
        count: number;
        status: string;
    }
    interface Reprint {
        cost_center: string;
        defect: string;
        description: string;
        printer_at_fault: string;
    }
    interface PrintJobCost {
        currency: "USD" | "CAD";
        line_item_costs: LineItemCost | LineItemCost[];
        shipping_cost: {
            tax_rate: string;
            total_cost_excl_tax: string;
            total_cost_incl_tax: string;
            total_tax: string;
        };
        total_cost_excl_tax: string;
        total_cost_incl_tax: string;
        total_discount_amount: string;
        total_tax: string;
    }
    interface PrintJob {
        child_job_ids?: number[];
        contact_email: string;
        costs?: PrintJobCost;
        date_created: string;
        date_modified: string;
        estimated_shipping_dates?: EstimatedShippingDates;
        external_id?: string;
        id: number;
        line_items: Printable[];
        order_id?: string;
        production_delay?: number;
        production_due_time?: string;
        shipping_address: ShippingAddress;
        shipping_level: ShippingLevel;
        shipping_option_level: ShippingLevel;
        tax_country?: string;
        status: Status;
    }
    interface IPrintJobs {
        list(params: PrintJobListOptions): Promise<IList<PrintJob>>;
        statistics(params: PrintJobStatisticsOptions): Promise<JobStatistics>;
        retrieve(id: string): Promise<PrintJob>;
        cost(id: string): Promise<PrintJobCost>;
        status(id: string): Promise<Status>;
        calculation(param: PrintJobCalculationOptions): Promise<PrintJobCost>;
    }
    class PrintJobs implements IPrintJobs {
        private client;
        constructor(client: Client);
        list(params: PrintJobListOptions): Promise<IList<PrintJob>>;
        statistics(params: PrintJobStatisticsOptions): Promise<JobStatistics>;
        retrieve(id: string): Promise<PrintJob>;
        cost(id: string): Promise<PrintJobCost>;
        status(id: string): Promise<Status>;
        calculation(param: PrintJobCalculationOptions): Promise<PrintJobCost>;
    }
}
