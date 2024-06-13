interface Decorations {
    getters?: {
        [field: string]: () => any;
    };
}
export declare function decorate<T extends object>(target: T, decorations: Decorations): T;
export {};
