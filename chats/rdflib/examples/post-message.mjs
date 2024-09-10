import ChatsModule from "../dist/index.js";
import { Fetcher, graph, UpdateManager } from "rdflib";
import { faker } from "@faker-js/faker";

const store = graph();
const fetcher = new Fetcher(store);
const updater = new UpdateManager(store);

const module = new ChatsModule({ store, fetcher, updater });

const chatUri = "http://localhost:3000/alice/public/chats/lobby/index.ttl#this";

await module.postMessage({
  chatUri,
  text: `${faker.word.noun()} ${faker.word.verb()} ${faker.word.adverb()}`,
  authorWebId: "https://localhost:3000/alice/profile/card#me"
});

const chat = await module.readChat(chatUri);

console.log(chat.name);
console.table(chat.latestMessages);