// import StubHeaders from '@/testing/lib/stubs/StubHeaders';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import StubHeaders from "./StubHeaders";
export default class StubResponse {
    static make(content = '', headers = {}, status = 200) {
        return new StubResponse(status, content, headers);
    }
    static notFound() {
        return new StubResponse(404);
    }
    constructor(status, content = '', headers = {}) {
        this.status = status;
        this.content = content;
        this.headers = StubHeaders.make(headers);
    }
    arrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('StubResponse.arrayBuffer is not implemented');
        });
    }
    blob() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('StubResponse.blob is not implemented');
        });
    }
    formData() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('StubResponse.formData is not implemented');
        });
    }
    json() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(this.content);
        });
    }
    text() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.content;
        });
    }
    clone() {
        return Object.assign({}, this);
    }
}
