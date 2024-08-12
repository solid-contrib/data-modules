import ChatsModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";

import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);

const module = new ChatsModule({store, fetcher, updater});

const name = `Chat about ${faker.word.sample()}`;

const uri = await module.createChat({
    containerUri: "http://localhost:3000/alice/public/chats/",
    name,
});

console.log("new chat created:", name, uri);
