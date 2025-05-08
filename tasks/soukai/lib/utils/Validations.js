"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validations {
    get required() {
        return (value) => !!value || 'This field is required';
    }
    minLength(length) {
        return (value) => (value && value.length >= length) ||
            `This field must be more than ${length} characters long`;
    }
    maxLength(length) {
        return (value) => (value && value.length <= length) ||
            `This field must be less than ${length} characters long`;
    }
}
exports.default = new Validations();
