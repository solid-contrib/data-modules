export default abstract class User {
    name: string;
    avatarUrl: string | null;
    storages: string[];
    constructor(name: string, avatarUrl: string | null, storages: string[]);
}
