import { LuluConfigOptions } from './common/interfaces/index';
import { Client } from './client';
import { resource } from './common/common.resource';

export class LuluService extends Client {
    shippingOptions!: resource.ShippingOptions;
    printJobs!: resource.PrintJobs;

    constructor(config: LuluConfigOptions) {
        super(config);

        this.shippingOptions = new resource.ShippingOptions(this);
        this.printJobs = new resource.PrintJobs(this);
    }
}