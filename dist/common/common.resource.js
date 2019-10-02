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
    class PrintJobs {
        constructor(client) {
            this.client = client;
        }
        list(params) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('list params', params);
                let opts = {
                    method: 'GET',
                    uri: '/print-jobs/',
                    qs: params
                };
                console.log('qs', opts.qs);
                return yield this.client.request(opts);
            });
        }
        statistics(params) {
            return __awaiter(this, void 0, void 0, function* () {
                let opts = {
                    method: 'GET',
                    uri: '/print-jobs/statistics/',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                    qs: params
                };
                return yield this.client.request(opts);
            });
        }
        retrieve(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let opts = {
                    method: 'GET',
                    uri: `/print-jobs/${id}/`,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                };
                return yield this.client.request(opts);
            });
        }
        cost(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let opts = {
                    method: 'GET',
                    uri: `/print-jobs/${id}/costs/`,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                };
                return yield this.client.request(opts);
            });
        }
        status(id) {
            return __awaiter(this, void 0, void 0, function* () {
                let opts = {
                    method: 'GET',
                    uri: `/print-jobs/${id}/status/`,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                };
                return yield this.client.request(opts);
            });
        }
        calculation(param) {
            return __awaiter(this, void 0, void 0, function* () {
                let opts = {
                    method: 'POST',
                    uri: `/print-job-cost-calculations/`,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                    body: param,
                    json: true
                };
                return yield this.client.request(opts);
            });
        }
    }
    resource.PrintJobs = PrintJobs;
})(resource = exports.resource || (exports.resource = {}));
