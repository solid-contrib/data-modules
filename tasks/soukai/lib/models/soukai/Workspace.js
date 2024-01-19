"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const soukai_1 = require("soukai");
const soukai_solid_1 = require("soukai-solid");
const List_1 = __importDefault(require("./List"));
const decorators_1 = require("../../utils/decorators");
const Storage_1 = __importDefault(require("../../utils/Storage"));
class Workspace extends soukai_solid_1.SolidModel {
    setActiveList(list) {
        this.activeList = list;
        Storage_1.default.set('activeListId', list.id);
    }
    listsRelationship() {
        return this.contains(List_1.default);
    }
    save(containerUrl) {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const model = yield _super.save.call(this, containerUrl);
            if (!this.inbox.exists()) {
                const list = (yield List_1.default.find(this.url));
                list.setRelationModels('tasks', []);
                this.setInbox(list);
            }
            return model;
        });
    }
    initialize(attributes, exists) {
        super.initialize(attributes, exists);
        const list = new List_1.default(this.getAttributes(), false);
        list.setRelationModels('tasks', []);
        this.setInbox(list);
        if (this.exists()) {
            this.updateInbox();
        }
    }
    updateInbox() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield List_1.default.find(this.getAttribute('url'));
            this.setInbox(list);
        });
    }
    setInbox(list) {
        const inbox = (0, decorators_1.decorate)(list, {
            getters: {
                name: () => 'Inbox',
            },
        });
        inbox.editable = false;
        inbox.setRelationModels('workspace', this);
        if (!this.activeList || this.activeList === this.inbox) {
            this.activeList = inbox;
        }
        this.inbox = inbox;
    }
}
exports.default = Workspace;
Workspace.ldpContainer = true;
Workspace.rdfContexts = {
    'lifecycle': 'http://purl.org/vocab/lifecycle/schema#',
};
Workspace.rdfsClasses = ['lifecycle:TaskGroup'];
Workspace.fields = {
    name: {
        type: soukai_1.FieldType.String,
        rdfProperty: 'rdfs:label',
        required: true,
    },
};
Workspace.classFields = ['inbox', 'activeList'];
