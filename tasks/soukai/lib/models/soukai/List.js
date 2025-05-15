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
const Task_1 = __importDefault(require("./Task"));
const Workspace_1 = __importDefault(require("./Workspace"));
const AsyncOperation_1 = __importDefault(require("../../utils/AsyncOperation"));
class List extends soukai_solid_1.SolidModel {
    constructor() {
        super(...arguments);
        this.editable = true;
    }
    get empty() {
        return this.isRelationLoaded('tasks') ? this.tasks.length === 0 : true;
    }
    get length() {
        return this.isRelationLoaded('tasks') ? this.tasks.length : 0;
    }
    workspaceRelationship() {
        return this.isContainedBy(Workspace_1.default);
    }
    tasksRelationship() {
        return this.hasMany(Task_1.default, 'taskUrls');
    }
    createTask(attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO implement this.tasksRelationship().create(attributes); in soukai
            const task = new Task_1.default(attributes);
            const operation = new AsyncOperation_1.default(task.updatesListener);
            try {
                operation.start();
                if (this.isRelationLoaded('tasks')) {
                    this.setRelationModels('tasks', [...this.tasks || [], task]);
                }
                yield task.save(this.url);
                yield this.update({ taskUrls: [...this.taskUrls, task.url] });
                operation.complete();
                return task;
            }
            catch (error) {
                operation.fail(error);
                const index = (this.tasks || []).indexOf(task);
                if (index !== -1) {
                    const tasks = [...this.tasks];
                    tasks.splice(index, 1);
                    this.setRelationModels('tasks', tasks);
                }
                throw error;
            }
        });
    }
}
exports.default = List;
List.ldpContainer = true;
List.rdfContexts = {
    'lifecycle': 'http://purl.org/vocab/lifecycle/schema#',
};
List.rdfsClasses = ['lifecycle:TaskGroup'];
List.fields = {
    name: {
        type: soukai_1.FieldType.String,
        rdfProperty: 'rdfs:label',
        required: true,
    },
    taskUrls: {
        type: soukai_1.FieldType.Array,
        rdfProperty: 'lifecycle:task',
        items: { type: soukai_1.FieldType.Key },
    },
};
