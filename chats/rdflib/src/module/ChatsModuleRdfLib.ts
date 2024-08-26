import { Chat, ChatsModule, CreateChatCommand } from "../index.js";
import { Fetcher, IndexedFormula, NamedNode, sym, UpdateManager } from "rdflib";

import {
  ContainerQuery,
  executeUpdate,
  ldp,
  ModuleSupport,
  rdf,
} from "@solid-data-modules/rdflib-utils";
import { generateId } from "@solid-data-modules/rdflib-utils/identifier";
import { createChat } from "./update-operations/index.js";
import { ChatQuery } from "./queries/index.js";
import { MessagesDocumentQuery } from './queries/MessagesDocumentQuery.js';

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

    const latestMessages = await this.fetchLatestMessages(container, chatNode);

    return {
      uri: chatUri,
      name,
      latestMessages,
    };
  }

  private async fetchLatestMessages(container: NamedNode, chatNode: NamedNode) {
    const latestYear = await this.fetchLatestSubContainer(container);
    if (!latestYear) return [];

    const latestMonth = await this.fetchLatestSubContainer(latestYear);
    const latestDay = await this.fetchLatestSubContainer(latestMonth);
    const messagesDocument = await this.fetchLatestDocument(latestDay);

    return new MessagesDocumentQuery(
      chatNode,
      messagesDocument,
      this.store,
    ).queryMessages();
  }

  private async fetchLatestSubContainer(container: NamedNode) {
    await this.support.fetchNode(container);

    const contents = new ContainerQuery(container, this.store).queryContents();
    const childContainers = contents.filter((it) => {
      return this.store.holds(
        it,
        rdf("type"),
        ldp("Container"),
        container.doc(),
      );
    });
    return childContainers[0]; // TODO actually get latest
  }

  private async fetchLatestDocument(container: NamedNode) {
    await this.support.fetchNode(container);

    const contents = new ContainerQuery(container, this.store).queryContents();
    const files = contents.filter(
      (it) =>
        !this.store.holds(it, rdf("type"), ldp("Container"), container.doc()),
    );
    const anyDocument = files[0]; // TODO actually get latest
    await this.support.fetchNode(anyDocument);
    return anyDocument;
  }
}
