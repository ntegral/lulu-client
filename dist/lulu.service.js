"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const common_resource_1 = require("./common/common.resource");
class LuluService extends client_1.Client {
    constructor(config) {
        super(config);
        this.shippingOptions = new common_resource_1.resource.ShippingOptions(this);
    }
}
exports.LuluService = LuluService;
