export default class StubHeaders {
    static make(data) {
        return new StubHeaders(data);
    }
    constructor(data) {
        this.data = {};
        for (const [name, value] of Object.entries(data)) {
            this.set(name, value);
        }
    }
    [Symbol.iterator]() {
        throw new Error('Method not implemented.');
    }
    entries() {
        throw new Error('Method not implemented.');
    }
    keys() {
        throw new Error('Method not implemented.');
    }
    values() {
        throw new Error('Method not implemented.');
    }
    append(name, value) {
        this.data[this.normalizeHeader(name)] = value;
    }
    delete(name) {
        delete this.data[this.normalizeHeader(name)];
    }
    get(name) {
        var _a;
        return (_a = this.data[this.normalizeHeader(name)]) !== null && _a !== void 0 ? _a : null;
    }
    has(name) {
        return this.normalizeHeader(name) in this.data;
    }
    set(name, value) {
        this.data[this.normalizeHeader(name)] = value;
    }
    forEach(callbackfn) {
        for (const [name, value] of Object.entries(this.data)) {
            callbackfn(value, name, this);
        }
    }
    normalizeHeader(name) {
        return name.toLowerCase();
    }
}
