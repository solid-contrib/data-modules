declare class Storage {
    set(key: string, value: any): void;
    get(key: string, defaultValue?: any): any;
    has(key: string): boolean;
    remove(key: string): void;
}
declare const _default: Storage;
export default _default;
