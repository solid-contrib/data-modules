"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const soukai_1 = require("soukai");
const soukai_solid_1 = require("soukai-solid");
class Task extends soukai_solid_1.SolidModel {
    constructor() {
        super(...arguments);
        this.saving = false;
    }
    get completed() {
        return !!this.completedAt;
    }
    get starred() {
        return !!this.priority && this.priority > 0;
    }
    get updatesListener() {
        return {
            onDelayed: () => this.saving = true,
            onCompleted: () => this.saving = false,
            onFailed: () => this.saving = false,
        };
    }
    toggleCompleted() {
        this.completed
            ? delete this.completedAt
            : this.completedAt = new Date;
    }
    toggleStarred() {
        this.starred
            ? delete this.priority
            : this.priority = 1;
    }
}
exports.default = Task;
Task.rdfContexts = {
    'lifecycle': 'http://purl.org/vocab/lifecycle/schema#',
    'cal': 'http://www.w3.org/2002/12/cal/ical#',
};
Task.rdfsClasses = ['lifecycle:Task'];
Task.fields = {
    name: {
        type: soukai_1.FieldType.String,
        rdfProperty: 'rdfs:label',
        required: true,
    },
    description: {
        type: soukai_1.FieldType.String,
        rdfProperty: 'rdfs:comment',
    },
    priority: {
        type: soukai_1.FieldType.Number,
        rdfProperty: 'cal:priority',
    },
    dueAt: {
        type: soukai_1.FieldType.Date,
        rdfProperty: 'cal:due',
    },
    completedAt: {
        type: soukai_1.FieldType.Date,
        rdfProperty: 'cal:completed',
    },
};
