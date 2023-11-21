import type { JsonLD } from '@noeldemartin/solid-utils';
declare class RDF {
    getJsonLDProperty<T = unknown>(json: JsonLD, property: string): T | null;
    private getJsonLDPropertyValue;
}
declare const _default: RDF;
export default _default;
