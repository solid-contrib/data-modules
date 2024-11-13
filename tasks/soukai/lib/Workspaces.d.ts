import { Store } from 'vuex';
import Service from '@/services/Service';
import User from '@/models/users/User';
import Workspace from '@/models/soukai/Workspace';
interface State {
    activeWorkspace: Workspace | null;
    workspaces: Workspace[];
}
export default class Workspaces extends Service {
    get empty(): boolean;
    get active(): Workspace | null;
    get all(): Workspace[];
    setActive(workspace: Workspace | null): Promise<void>;
    add(workspace: Workspace, activate?: boolean): void;
    remove(workspace: Workspace): void;
    protected get storage(): State;
    protected init(): Promise<void>;
    protected registerStoreModule(store: Store<State>): void;
    protected unregisterStoreModule(store: Store<State>): void;
    protected load(user: User): Promise<void>;
    protected unload(): Promise<void>;
    private loadWorkspace;
}
export {};
