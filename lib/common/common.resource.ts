import * as rp from 'request-promise';

import { IList } from "./interfaces";
import { Client } from "../client";

export namespace resource {
    export type TitleOptions = "MR" | "MISS" | "MRS" | "MS" | "DR";
    export type ShippingLevel =
        | 'MAIL'
        | 'PRIORITY_MAIL'
        | 'GROUND_HD'
        | 'GROUND_BUS'
        | 'GROUND'
        | 'EXPEDITED'
        | 'EXPRESS';

    export interface ShippingAddress {
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

    export interface IPaging {
        page: number;
        page_size: number;
    }

    export interface Discount {
        amount: string;
        description: string;
    }

    // Lulu Shipping Options //
    export interface ShippingListOptions extends IPaging {
        iso_country_code?: string,
        currency?: string,
        quantity?: string,
        pod_package_id?: string,
        state_code?: string,
        level?: ShippingLevel,
        postbox_ok?: boolean,
        fastest_per_level?: boolean,
    }

    export interface ShippingOption {
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

    export interface IShippingOptions {
        list(params: ShippingListOptions): Promise<IList<ShippingOption>>;
    }

    export class ShippingOptions implements IShippingOptions {
        constructor(private client: Client) {}

        /**
         * @param { ShippingListOptions } params - the shipping option list options
         * @return Promise<IList<<ShippingOption>>
         */
        async list(params: ShippingListOptions): Promise<IList<ShippingOption>> {
            // console.log('list params', params);
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: '/print-shipping-options/',
                qs: params
            };
            // console.log('qs', opts.qs);
            return await this.client.request(opts);
        }
    }

    // Lulu Print Jobs //
    export interface PrintJobListOptions extends IPaging {
        created_after?: string,
        created_before?: string,
        modified_after?: string,
        modified_before?: string,
        id?: string,
        order_id?: string,
        exclude_line_items?: boolean,
        search?: string,
        ordering?: string
    }

    export interface PrintJobStatisticsOptions extends IPaging {
        created_after?: string,
        created_before?: string,
        modified_after?: string,
        modified_before?: string,
        id?: string,
        ordering?: string
    }

    export interface PrintJobEstimateItem {
        page_count: number;
        pod_package_id: string;
        quantity: number;
    }

    export interface PrintJobCalculationOptions {
        line_items: PrintJobEstimateItem[],
        shipping_address: ShippingAddress;
        shipping_option: ShippingLevel;
    }

    export interface EstimatedShippingDates {
        arrival_max: string;
        arrival_min: string;
        dispatch_max: string;
        dispatch_min: string;
    }

    export interface LineItemCost {
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

    export interface ShippingCost {
        tax_rate: string;
        total_cost_excl_tax: string;
        total_cost_incl_tax: string;
        total_tax: string;
    }

    export interface Message {
        delay: string;
        error: string;
        info: string;
        printable_normalization: PrintableNormalization;
        timestamp: string;
        url: string | string[];
    }

    export interface File {
        file_id: number;
        filename: string;
    }

    export interface Cover extends PrintableItem {}

    export interface Interior extends PrintableItem {}

    export interface PrintableItem {
        job_id: number;
        normalized_file: File;
        page_count: number;
        source_file: File;
        source_md5sum: string;
        source_url: string;
    }

    export interface PrintableNormalization {
        cover: string[];
        interior: string[];
        pod_package_id: string;
    }

    export interface Status {
        changed?: string;
        messages: string | Message;
        name: "CREATED" | "ACCEPTED" | "REJECTED" | "IN_PRODUCTION" | "ERROR" | "SHIPPED";
    }

    export interface Printable {
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

    export interface JobStatistics {
        count: number;
        status: string;
    }

    export interface Reprint {
        cost_center: string;
        defect: string;
        description: string;
        printer_at_fault: string;
    }

    export interface PrintJobCost {
        currency: "USD" | "CAD",
        line_item_costs: LineItemCost | LineItemCost [];
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

    export interface PrintJob {
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

    export interface PrintJobSource {
        source_url: string;
        source_md5_sum?: string;
    }

    export interface PrintJobCover extends PrintJobSource { }
    export interface PrintJobInterior extends PrintJobSource {}
    export interface PrintableNormalizationCover extends PrintJobSource {
        job_id: string;
    }

    export interface PrintableNormalizationInterior extends PrintJobSource {
        job_id: string;
    }

    export interface PrintJobCreateOptions {
        contact_email: string;
        external_id?: string;
        line_items: PrintJobCreateLineItem[];
        production_delay?: number;
        shipping_address: ShippingAddress;
        shipping_level: ShippingLevel;
    }

    export interface PrintJobCreateLineItem {
        cover?: PrintJobCover;
        interior?: PrintJobInterior;
        pod_package_id?: string;
        printable_id?: string;
        printable_normalization?: {
            cover: PrintableNormalizationCover;
            interior: PrintableNormalizationInterior;
            pod_package_id: string;
        }
        external_id: string;
        quantity: number;
        title: string;
    }

    export interface IPrintJobs {
        list(params: PrintJobListOptions): Promise<IList<PrintJob>>

        statistics(params: PrintJobStatisticsOptions): Promise<JobStatistics>

        retrieve(id: string): Promise<PrintJob>

        cost(id: string): Promise<PrintJobCost>

        status(id: string): Promise<Status>

        calculation(param: PrintJobCalculationOptions): Promise<PrintJobCost>

        create(params: PrintJobCreateOptions) : Promise<PrintJob>
    }

    export class PrintJobs implements IPrintJobs {

        constructor(private client: Client) {}

        /**
         * Retrieve a list of Print-Jobs
         * @param { PrintJobListOptions } params - the print job list options
         * @return Promise<IList<Printable>>
         */
        async list(params: PrintJobListOptions): Promise<IList<PrintJob>> {
            // console.log('list params', params);
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: '/print-jobs/',
                qs: params
            };
            // console.log('qs', opts.qs);
            return await this.client.request(opts);
        }

        /**
         * Retrieve the number of Print-Jobs in each status
         * @param { PrintJobStatisticsOptions } params - the print statistics retrieve options
         * @return Promise<JobStatistics>
         */
        async statistics(params: PrintJobStatisticsOptions): Promise<JobStatistics> {
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: '/print-jobs/statistics/',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                qs: params
            };

            return await this.client.request(opts);
        }

        /**
         * Retrieve a single Print-Job by id.
         * @param {string} id - Id of the resource
         * @return Promise<PrintJob>
         */
        async retrieve(id: string): Promise<PrintJob> {
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: `/print-jobs/${id}/`,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            };

            return await this.client.request(opts);
        }

        /**
         * Retrieve Print-Job Costs
         * Sub-resource to retrieve only the costs of a Print-Job
         * @param {string} id - Id of the resource
         * @return Promise<PrintJobCost>
         */
        async cost(id: string): Promise<PrintJobCost> {
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: `/print-jobs/${id}/costs/`,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            };

            return await this.client.request(opts);
        }

        /**
         * Retrieve Print-Job Status
         * Sub-resource that represents the status of a Print-Job
         * @param {string} id - Id of the resource
         * @return Promise<Status>
         */
        async status(id: string): Promise<Status> {
            let opts: rp.OptionsWithUri = {
                method: 'GET',
                uri: `/print-jobs/${id}/status/`,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
            };

            return await this.client.request(opts);
        }

        /**
         * Create a Print-Job cost calculation
         * This endpoint allows you to calculate product and shipping cost without creating a Print-Job.
         * This is typically used in an offer or checkout situation. The address is required to calculate
         * sales tax / VAT and shipping cost.
         * @param {PrintJobCalculationOptions} param - Sample print job to estimate the cost of
         * @return Promise<PrintJobCost>
         */
        async calculation(param: PrintJobCalculationOptions): Promise<PrintJobCost> {
            let opts: rp.OptionsWithUri = {
                method: 'POST',
                uri: `/print-job-cost-calculations/`,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: param,
                json: true
            };

            return await this.client.request(opts);
        }

        /**
         * Create a new Print-Job
         * @param { PrintJobCreateOptions } params - Print-Jobs are the core resource of the Print API. A Printjob consists of line items, shipping information and some additional metadata.
         * @return Promise<IList<Printable>>
         */
        async create(param: PrintJobCreateOptions): Promise<PrintJob> {
            let opts: rp.OptionsWithUri = {
                method: 'POST',
                uri: `/print-jobs/`,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                body: param,
                json: true
            };

            return await this.client.request(opts);
        }
    }
}