declare class EventBus {
    private bus;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    once(event: string, callback: Function): void;
    emit(event: string, payload?: any): void;
}
declare const _default: EventBus;
export default _default;
