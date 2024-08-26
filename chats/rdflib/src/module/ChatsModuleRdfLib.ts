import { Chat, ChatsModule, CreateChatCommand } from "../index.js";
import {
  Fetcher,
  IndexedFormula,
  NamedNode,
  Node,
  sym,
  UpdateManager,
} from "rdflib";

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
import { wf } from "./namespaces.js";

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
    await this.support.fetchNode(container);
    const contents = new ContainerQuery(container, this.store).queryContents();
    const yearContainers = contents.filter((it) => {
      return this.store.holds(
        it,
        rdf("type"),
        ldp("Container"),
        container.doc(),
      );
    });
    const anyYear = yearContainers[0];

    if (!anyYear) return [];

    await this.support.fetchNode(anyYear);

    const yearContents = new ContainerQuery(
      anyYear,
      this.store,
    ).queryContents();
    const monthsContainers = yearContents.filter((it) =>
      this.store.holds(it, rdf("type"), ldp("Container"), anyYear.doc()),
    );
    const anyMonth = monthsContainers[0];
    await this.support.fetchNode(anyMonth);

    const monthContents = new ContainerQuery(
      anyMonth,
      this.store,
    ).queryContents();
    const dayContainers = monthContents.filter((it) =>
      this.store.holds(it, rdf("type"), ldp("Container"), anyMonth.doc()),
    );
    const anyDay = dayContainers[0];
    await this.support.fetchNode(anyDay);

    const dayContents = new ContainerQuery(anyDay, this.store).queryContents();
    const dayFiles = dayContents.filter(
      (it) =>
        !this.store.holds(it, rdf("type"), ldp("Container"), anyDay.doc()),
    );
    const anyFile = dayFiles[0];
    await this.support.fetchNode(anyFile);

    const messages: Node[] = this.store.each(
      chatNode,
      wf("message"),
      undefined,
      anyFile,
    );

    const latestMessages = messages.map((it) => ({
      text: "Hello visitor, welcome to my public chat lobby!",
      date: new Date("2024-07-01T17:47:14Z"),
      authorWebId: "http://localhost:3000/alice/profile/card#me",
    }));
    return latestMessages;
  }
}
