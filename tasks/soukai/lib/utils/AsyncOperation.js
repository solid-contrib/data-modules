"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
class DefaultListener {
    constructor() {
        this.delayed = false;
    }
    onDelayed() {
        DefaultListener.ongoingDelayedOperations++;
        this.delayed = true;
        this.updateSnackbar();
    }
    onCompleted() {
        if (!this.delayed)
            return;
        DefaultListener.ongoingDelayedOperations--;
        this.updateSnackbar();
    }
    onFailed(error) {
        if (!this.delayed)
            return;
        DefaultListener.ongoingDelayedOperations--;
        this.updateSnackbar();
        if (error)
            vue_1.default.instance.$ui.showError(error);
    }
    updateSnackbar() {
        if (DefaultListener.ongoingDelayedOperations === 1)
            vue_1.default.instance.$ui.showSnackbar({
                message: 'Saving changes...',
                loading: true,
            });
        else if (DefaultListener.ongoingDelayedOperations > 0)
            vue_1.default.instance.$ui.showSnackbar({
                message: `Saving ${DefaultListener.ongoingDelayedOperations} changes...`,
                loading: true,
            });
        else
            vue_1.default.instance.$ui.hideSnackbar();
    }
}
DefaultListener.ongoingDelayedOperations = 0;
class AsyncOperation {
    constructor(listener) {
        this.listener = listener || new DefaultListener;
    }
    start(expectedDuration) {
        this.delayTimeout = setTimeout(() => this.emit('onDelayed'), expectedDuration || AsyncOperation.DEFAULT_EXPECTED_DURATION);
        this.emit('onStarted');
    }
    complete() {
        this.clearDelayTimeout();
        this.emit('onCompleted');
    }
    fail(error) {
        this.clearDelayTimeout();
        this.emit('onFailed', error);
    }
    clearDelayTimeout() {
        if (!this.delayTimeout)
            return;
        clearTimeout(this.delayTimeout);
        delete this.delayTimeout;
    }
    emit(event, ...args) {
        if (event in this.listener)
            this.listener[event](...args);
    }
}
exports.default = AsyncOperation;
AsyncOperation.DEFAULT_EXPECTED_DURATION = 1000;
