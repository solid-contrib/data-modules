"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Str {
    slug(text) {
        return text
            .replace(/[^\d\w]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }
}
exports.default = new Str();
