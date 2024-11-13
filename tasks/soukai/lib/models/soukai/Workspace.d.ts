import { MultiModelRelation, Attributes, Model } from 'soukai';
import { SolidModel } from 'soukai-solid';
import List from './List';
export default class Workspace extends SolidModel {
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
    };
    static classFields: string[];
    inbox: List;
    lists?: List[];
    activeList: List;
    setActiveList(list: List): void;
    listsRelationship(): MultiModelRelation;
    save<T extends Model>(containerUrl?: string): Promise<T>;
    protected initialize(attributes: Attributes, exists: boolean): void;
    private updateInbox;
    private setInbox;
}
