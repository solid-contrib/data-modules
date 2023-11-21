import type { Constructor } from '@noeldemartin/utils';
interface ContainerOptions {
    baseUrl: string;
}
interface DocumentOptions extends ContainerOptions {
    containerUrl: string;
    name: string;
}
interface ResourceOptions extends DocumentOptions {
    documentUrl: string;
    hash: string;
}
export declare function assertInstanceOf<T>(object: unknown, constructor: Constructor<T>, assert: (instance: T) => void): void;
export declare function fakeContainerUrl(options?: Partial<ContainerOptions>): string;
export declare function fakeDocumentUrl(options?: Partial<DocumentOptions>): string;
export declare function fakeResourceUrl(options?: Partial<ResourceOptions>): string;
export declare function loadFixture<T = string>(name: string): T;
export {};
