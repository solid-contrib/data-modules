"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Arr {
    last(array) {
        return array[array.length - 1];
    }
    make(length, value = null) {
        return (new Array(length)).fill(value);
    }
}
exports.default = new Arr();
