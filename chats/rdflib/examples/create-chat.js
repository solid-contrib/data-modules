import ChatsModule from '../dist/index.js';
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph()
const fetcher = new Fetcher(store)
const updater = new UpdateManager(store)

new ChatsModule({store, fetcher, updater})

// TODO use modules
