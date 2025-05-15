import { ValidationRule } from 'vuetify';
declare class Validations {
    get required(): ValidationRule;
    minLength(length: number): ValidationRule;
    maxLength(length: number): ValidationRule;
}
declare const _default: Validations;
export default _default;
