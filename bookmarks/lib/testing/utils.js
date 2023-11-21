import { faker } from '@noeldemartin/faker';
import { readFileSync } from 'fs';
import { stringToSlug } from '@noeldemartin/utils';
export function assertInstanceOf(object, constructor, assert) {
    expect(object).toBeInstanceOf(constructor);
    assert(object);
}
export function fakeContainerUrl(options = {}) {
    var _a;
    const baseUrl = (_a = options.baseUrl) !== null && _a !== void 0 ? _a : faker.internet.url();
    return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
}
export function fakeDocumentUrl(options = {}) {
    var _a, _b;
    const containerUrl = (_a = options.containerUrl) !== null && _a !== void 0 ? _a : fakeContainerUrl(options);
    const name = (_b = options.name) !== null && _b !== void 0 ? _b : faker.random.word();
    return containerUrl + stringToSlug(name);
}
export function fakeResourceUrl(options = {}) {
    var _a, _b;
    const documentUrl = (_a = options.documentUrl) !== null && _a !== void 0 ? _a : fakeDocumentUrl(options);
    const hash = (_b = options.hash) !== null && _b !== void 0 ? _b : 'it';
    return documentUrl + '#' + hash;
}
export function loadFixture(name) {
    const raw = readFileSync(`${__dirname}/../tests/fixtures/${name}`).toString();
    return /\.json(ld)$/.test(name)
        ? JSON.parse(raw)
        : raw;
}
