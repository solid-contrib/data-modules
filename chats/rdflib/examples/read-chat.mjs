import ChatsModule from "../dist/index.js";
import {Fetcher, graph, UpdateManager} from "rdflib";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);

const module = new ChatsModule({store, fetcher, updater});

const chat = await module.readChat("http://localhost:3000/alice/public/chats/lobby/index.ttl#this");

console.log(chat.name);
console.table(chat.latestMessages)
