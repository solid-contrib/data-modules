"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = void 0;
function decorate(target, decorations) {
    const getters = decorations.getters || {};
    return new Proxy(target, {
        get(target, property, receiver) {
            if (typeof property === 'string' && getters.hasOwnProperty(property)) {
                return getters[property]();
            }
            return Reflect.get(target, property, receiver);
        },
    });
}
exports.decorate = decorate;
