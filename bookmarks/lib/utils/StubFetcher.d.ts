/// <reference types="jest" />
/// <reference types="node" />
import { EventEmitter } from 'events';
declare class StubFetcher extends EventEmitter {
    fetchSpy: jest.SpyInstance<Promise<Response>, [RequestInfo, RequestInit?]>;
    private fetchResponses;
    reset(): void;
    addFetchNotFoundResponse(): void;
    addFetchResponse(content?: string, headers?: Record<string, string>, status?: number): void;
    fetch(_: RequestInfo, __?: RequestInit): Promise<Response>;
}
declare const instance: StubFetcher;
export default instance;
