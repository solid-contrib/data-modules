var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from 'events';
import StubResponse from './StubResponse';
class StubFetcher extends EventEmitter {
    constructor() {
        super(...arguments);
        this.fetchResponses = [];
    }
    reset() {
        this.fetchResponses = [];
        this.fetchSpy.mockClear();
    }
    addFetchNotFoundResponse() {
        this.fetchResponses.push(StubResponse.notFound());
    }
    addFetchResponse(content = '', headers = {}, status = 200) {
        this.fetchResponses.push(StubResponse.make(content, headers, status));
    }
    fetch(_, __) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = this.fetchResponses.shift();
            if (!response) {
                return new Promise((_, reject) => reject());
            }
            return response;
        });
    }
}
const instance = new StubFetcher();
instance.fetchSpy = jest.spyOn(instance, 'fetch');
export default instance;
