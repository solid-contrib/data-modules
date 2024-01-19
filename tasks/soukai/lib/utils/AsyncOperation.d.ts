export interface Listener {
    onStarted?(): void;
    onDelayed?(): void;
    onCompleted?(): void;
    onFailed?(error?: any): void;
}
export default class AsyncOperation {
    static DEFAULT_EXPECTED_DURATION: number;
    private listener;
    private delayTimeout?;
    constructor(listener?: Listener);
    start(expectedDuration?: number): void;
    complete(): void;
    fail(error?: any): void;
    private clearDelayTimeout;
    private emit;
}
