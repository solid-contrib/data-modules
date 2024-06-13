import User from './models/users/User';
import Workspace from './models/soukai/Workspace';


export async function getWorkspaces(user: User) {
    const workspaces: Workspace[] = [];
    for (const storage of user.storages) {
        workspaces.push(
            ...(await Workspace.from(storage).all<Workspace>()),
        );
    }
    return workspaces;
}