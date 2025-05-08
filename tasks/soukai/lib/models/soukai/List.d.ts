import { MultiModelRelation, SingleModelRelation, Attributes } from 'soukai';
import { SolidModel } from 'soukai-solid';
import Task from './Task';
import Workspace from './Workspace';
export default class List extends SolidModel {
    static ldpContainer: boolean;
    static rdfContexts: {
        lifecycle: string;
    };
    static rdfsClasses: string[];
    static fields: {
        name: {
            type: "string";
            rdfProperty: string;
            required: boolean;
        };
        taskUrls: {
            type: "array";
            rdfProperty: string;
            items: {
                type: "key";
            };
        };
    };
    name: string;
    workspace: Workspace;
    tasks?: Task[];
    editable: boolean;
    get empty(): boolean;
    get length(): number;
    workspaceRelationship(): SingleModelRelation;
    tasksRelationship(): MultiModelRelation;
    createTask(attributes: Attributes): Promise<Task>;
}
