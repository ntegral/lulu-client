"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var resource;
(function (resource) {
    class ShippingOptions {
        constructor(client) {
            this.client = client;
        }
        list(params) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('list params', params);
                let opts = {
                    method: 'GET',
                    uri: '/print-shipping-options/',
                    qs: params
                };
                console.log('qs', opts.qs);
                return yield this.client.request(opts);
            });
        }
    }
    resource.ShippingOptions = ShippingOptions;
})(resource = exports.resource || (exports.resource = {}));
