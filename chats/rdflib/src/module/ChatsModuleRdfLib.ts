import { Chat, ChatsModule, CreateChatCommand } from "../index.js";
import { Fetcher, IndexedFormula, sym, UpdateManager } from "rdflib";

import { executeUpdate, ModuleSupport } from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { createChat } from "./update-operations/index.js";
import { ChatQuery } from "./queries/index.js";

interface ModuleConfig {
  store: IndexedFormula;
  fetcher: Fetcher;
  updater: UpdateManager;
}

export class ChatsModuleRdfLib implements ChatsModule {
  private readonly fetcher: Fetcher;
  private readonly store: IndexedFormula;
  private readonly updater: UpdateManager;
  private readonly support: ModuleSupport;

  constructor(config: ModuleConfig) {
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
    this.support = new ModuleSupport(config);
  }

  async createChat({ containerUri, name }: CreateChatCommand): Promise<string> {
    const id = generateId();
    const mintedUri = `${containerUri}${id}/index.ttl#this`;
    const operation = createChat(mintedUri, name);
    await executeUpdate(this.fetcher, this.updater, operation);
    return mintedUri;
  }

  async readChat(chatUri: string): Promise<Chat> {
    const chatNode = sym(chatUri);
    await this.support.fetchNode(chatNode);

    const chatQuery = new ChatQuery(chatNode, this.store);
    const name = chatQuery.queryTitle();
    const container = chatQuery.queryContainer();

    await this.support.fetchNode(container);

    return {
      uri: chatUri,
      name,
      latestMessages: [
        {
          text: "Hello visitor, welcome to my public chat lobby!",
          date: new Date("2024-07-01T17:47:14Z"),
          authorWebId: "http://localhost:3000/alice/profile/card#me",
        },
      ],
    };
  }
}
