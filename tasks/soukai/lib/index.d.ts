import User from './models/users/User';
import Workspace from './models/soukai/Workspace';
export declare function getWorkspaces(user: User): Promise<Workspace[]>;
