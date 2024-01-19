"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
class EventBus {
    constructor() {
        this.bus = new vue_1.default();
    }
    on(event, callback) {
        this.bus.$on(event, callback);
    }
    off(event, callback) {
        this.bus.$off(event, callback);
    }
    once(event, callback) {
        this.bus.$once(event, callback);
    }
    emit(event, payload) {
        this.bus.$emit(event, payload);
    }
}
exports.default = new EventBus();
