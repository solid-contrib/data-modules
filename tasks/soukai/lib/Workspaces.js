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
const Service_1 = __importDefault(require("@/services/Service"));
const Workspace_1 = __importDefault(require("@/models/soukai/Workspace"));
const EventBus_1 = __importDefault(require("@/utils/EventBus"));
const Storage_1 = __importDefault(require("@/utils/Storage"));
class Workspaces extends Service_1.default {
    get empty() {
        return !this.storage.workspaces || this.storage.workspaces.length === 0;
    }
    get active() {
        return this.storage.activeWorkspace;
    }
    get all() {
        return this.storage.workspaces;
    }
    setActive(workspace) {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.$store.commit('setActiveWorkspace', workspace);
            if (workspace)
                Storage_1.default.set('activeWorkspaceId', workspace.id);
            else
                Storage_1.default.remove('activeWorkspaceId');
        });
    }
    add(workspace, activate = true) {
        this.app.$store.commit('addWorkspace', workspace);
        if (activate)
            this.setActive(workspace);
    }
    remove(workspace) {
        this.app.$store.commit('removeWorkspace', workspace);
        this.setActive(this.all.length > 0 ? this.all[0] : null);
    }
    get storage() {
        return this.app.$store.state.workspaces
            ? this.app.$store.state.workspaces
            : {};
    }
    init() {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.init.call(this);
            yield this.app.$auth.ready;
            if (this.app.$auth.isLoggedIn()) {
                yield this.load(this.app.$auth.user);
            }
            EventBus_1.default.on('login', this.load.bind(this));
            EventBus_1.default.on('logout', this.unload.bind(this));
        });
    }
    registerStoreModule(store) {
        store.registerModule('workspaces', {
            state: {
                activeWorkspace: null,
                workspaces: [],
            },
            mutations: {
                setActiveWorkspace(state, activeWorkspace) {
                    state.activeWorkspace = activeWorkspace;
                },
                setWorkspaces(state, workspaces) {
                    state.workspaces = workspaces;
                },
                addWorkspace(state, workspace) {
                    state.workspaces.push(workspace);
                },
                removeWorkspace(state, workspace) {
                    const index = state.workspaces.findIndex(existingWorkspace => existingWorkspace === workspace);
                    if (index !== -1) {
                        state.workspaces.splice(index, 1);
                    }
                },
            },
        });
    }
    unregisterStoreModule(store) {
        store.unregisterModule('workspaces');
    }
    load(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaces = [];
            const activeWorkspaceId = Storage_1.default.get('activeWorkspaceId');
            const activeListId = Storage_1.default.get('activeListId');
            let activeWorkspace;
            for (const storage of user.storages) {
                workspaces.push(...(yield Workspace_1.default.from(storage).all()));
            }
            activeWorkspace = workspaces.find(workspace => workspace.id === activeWorkspaceId);
            if (!activeWorkspace && workspaces.length > 0)
                activeWorkspace = workspaces[0];
            if (activeWorkspace)
                yield this.loadWorkspace(activeWorkspace, activeListId);
            this.app.$store.commit('setWorkspaces', workspaces);
            this.app.$store.commit('setActiveWorkspace', activeWorkspace);
        });
    }
    unload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.$store.commit('setWorkspaces', []);
            this.app.$store.commit('setActiveWorkspace', null);
            Storage_1.default.remove('activeWorkspaceId');
            Storage_1.default.remove('activeListId');
        });
    }
    loadWorkspace(workspace, activeListId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workspace.isRelationLoaded('lists')) {
                yield workspace.loadRelation('lists');
                // TODO this could be done automatically in Soukai
                for (const list of workspace.lists) {
                    list.setRelationModels('workspace', workspace);
                }
            }
            workspace.setActiveList(workspace.lists.find(list => list.id === activeListId) ||
                workspace.activeList);
            if (workspace && !workspace.activeList.isRelationLoaded('tasks'))
                yield workspace.activeList.loadRelation('tasks');
        });
    }
}
exports.default = Workspaces;
