"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
class Uuid {
    v4(options) {
        return node_crypto_1.default.randomUUID(options);
    }
}
exports.Uuid = Uuid;
exports.default = new Uuid();
