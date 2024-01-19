/// <reference types="node" />
import crypto from 'node:crypto';
export declare class Uuid {
    v4(options?: crypto.RandomUUIDOptions | undefined): string;
}
declare const _default: Uuid;
export default _default;
