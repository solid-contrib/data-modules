"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Str_1 = __importDefault(require("./Str"));
describe('Str', () => {
    it('creates slug', () => {
        expect(Str_1.default.slug('Foo Bar')).toBe('foo-bar');
    });
});
