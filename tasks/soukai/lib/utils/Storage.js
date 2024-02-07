"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Storage {
    set(key, value) {
        if (typeof value === 'undefined')
            value = '__undefined__';
        localStorage.setItem(key, JSON.stringify(value));
    }
    get(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        if (value === null)
            return defaultValue;
        if (value === '__undefined__')
            return undefined;
        return JSON.parse(value);
    }
    has(key) {
        return localStorage.getItem(key) !== null;
    }
    remove(key) {
        localStorage.removeItem(key);
    }
}
exports.default = new Storage();
