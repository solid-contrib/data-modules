"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Clock {
    sleep(wait) {
        return new Promise(resolve => setTimeout(resolve, wait));
    }
}
exports.default = new Clock();
