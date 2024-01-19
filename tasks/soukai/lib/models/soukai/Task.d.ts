import { SolidModel } from 'soukai-solid';
import { Listener as AsyncOperationListener } from '../../utils/AsyncOperation';
export default class Task extends SolidModel {
    static rdfContexts: {
        lifecycle: string;
        cal: string;
    };
    static rdfsClasses: string[];
    static fields: {
        name: {
            type: "string";
            rdfProperty: string;
            required: boolean;
        };
        description: {
            type: "string";
            rdfProperty: string;
        };
        priority: {
            type: "number";
            rdfProperty: string;
        };
        dueAt: {
            type: "date";
            rdfProperty: string;
        };
        completedAt: {
            type: "date";
            rdfProperty: string;
        };
    };
    saving: boolean;
    get completed(): boolean;
    get starred(): boolean;
    get updatesListener(): AsyncOperationListener;
    toggleCompleted(): void;
    toggleStarred(): void;
}
