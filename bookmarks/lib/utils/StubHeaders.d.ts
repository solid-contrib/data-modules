export default class StubHeaders implements Headers {
    static make(data: Record<string, string>): StubHeaders;
    private data;
    private constructor();
    [Symbol.iterator](): IterableIterator<[string, string]>;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callbackfn: (value: string, name: string, parent: Headers) => void): void;
    private normalizeHeader;
}
