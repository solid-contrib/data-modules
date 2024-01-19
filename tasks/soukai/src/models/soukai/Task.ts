import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

import { Listener as AsyncOperationListener } from '../../utils/AsyncOperation';

export default class Task extends SolidModel {

    public static rdfContexts = {
        'lifecycle': 'http://purl.org/vocab/lifecycle/schema#',
        'cal': 'http://www.w3.org/2002/12/cal/ical#',
    };

    public static rdfsClasses = ['lifecycle:Task'];

    public static fields = {
        name: {
            type: FieldType.String,
            rdfProperty: 'rdfs:label',
            required: true,
        },
        description: {
            type: FieldType.String,
            rdfProperty: 'rdfs:comment',
        },
        priority: {
            type: FieldType.Number,
            rdfProperty: 'cal:priority',
        },
        dueAt: {
            type: FieldType.Date,
            rdfProperty: 'cal:due',
        },
        completedAt: {
            type: FieldType.Date,
            rdfProperty: 'cal:completed',
        },
    };

    public saving = false;

    get completed(): boolean {
        return !!(this as any).completedAt;
    }

    get starred(): boolean {
        return !!(this as any).priority && (this as any).priority > 0;
    }

    get updatesListener(): AsyncOperationListener {
        return {
            onDelayed: () => this.saving = true,
            onCompleted: () => this.saving = false,
            onFailed: () => this.saving = false,
        };
    }

    public toggleCompleted(): void {
        this.completed
            ? delete (this as any).completedAt
            : (this as any).completedAt = new Date;
    }

    public toggleStarred(): void {
        this.starred
            ? delete (this as any).priority
            : (this as any).priority = 1;
    }

}
