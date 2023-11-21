import StubHeaders from "./StubHeaders";
export default class StubResponse implements Response {
    static make(content?: string, headers?: Record<string, string>, status?: number): StubResponse;
    static notFound(): StubResponse;
    private content;
    readonly body: ReadableStream<Uint8Array> | null;
    readonly bodyUsed: boolean;
    readonly headers: StubHeaders;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly trailer: Promise<Headers>;
    readonly type: ResponseType;
    readonly url: string;
    private constructor();
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json(): Promise<unknown>;
    text(): Promise<string>;
    clone(): Response;
}
