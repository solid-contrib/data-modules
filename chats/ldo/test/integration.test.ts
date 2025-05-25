import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupServer } from "@ldo/test-solid-server";
import { testFiles } from "./testFiles.helper";
import path from "path";
import { fileURLToPath } from "url";
import { ConnectedLdoDataset, createConnectedLdoDataset } from "@ldo/connected";
import { solidConnectedPlugin, SolidConnectedPlugin } from "@ldo/connected-solid";
import { Chat } from "../src";
import { ChatMessageShape, ChatShape } from "../src/.ldo/longChat.typings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URI = "http://localhost:3003/example/";
const WEB_ID = "http://example.com/profile/card#me"
const SAMPLE_CHAT_1_CONTAINER_URI = `${BASE_URI}sample-chat-1/`;
const SAMPLE_CHAT_1_INDEX_URI = `${SAMPLE_CHAT_1_CONTAINER_URI}index.ttl`;
const SAMPLE_CHAT_1_INDEX_INFO: ChatShape = {
  "@id": `${SAMPLE_CHAT_1_INDEX_URI}#this`,
  "type": { "@id": "LongChat" },
  author: { "@id": "http://example.com/profile/card#me" },
  created: "2023-11-25T20:58:21.266Z",
  title: "Scatterverse "
}
const SAMPLE_CHAT_1_MESSAGE_RESOURCE_1_URI = `${SAMPLE_CHAT_1_CONTAINER_URI}2023/11/25/index.ttl`;
const SAMPLE_CHAT_1_MESSAGE_RESOURCE_1__MESSAGES: ChatMessageShape[] = [
  {
    "@id": `${SAMPLE_CHAT_1_MESSAGE_RESOURCE_1_URI}#bf343557-915b-4302-8377-d6e98d0963fc`,
    created2: "2023-11-25T21:34:17.354Z",
    content: "If youre reading this, ily ",
    maker: { "@id": "http://example.com/profile/card#me" }
  },
  {
    "@id": `${SAMPLE_CHAT_1_MESSAGE_RESOURCE_1_URI}#c22cf637-7a5e-4c1f-b83d-74eeb6638657`,
    created2: "2023-11-25T20:59:49.014Z",
    content: "How many people actively use this?",
    maker: { "@id": "http://example.com/profile/card#me" }
  },
  {
    "@id": `${SAMPLE_CHAT_1_MESSAGE_RESOURCE_1_URI}#cb1a3293-d890-4d16-b462-ee60fceb3bc2`,
    created2: "2023-11-25T20:58:43.163Z",
    content: "this is pretty clean ",
    maker: { "@id": "http://example.com/profile/card#me" }
  },
  {
    "@id": `${SAMPLE_CHAT_1_MESSAGE_RESOURCE_1_URI}#6def4609-3a97-44a7-ac5f-7cb8d2c5d2e0`,
    created2: "2023-11-25T20:58:26.606Z",
    content: 'thmooove created "Scatterverse "',
    maker: { "@id": "http://example.com/profile/card#me" }
  },
]
const SAMPLE_CHAT_1_MESSAGE_RESOURCE_2_URI = `${SAMPLE_CHAT_1_CONTAINER_URI}2024/11/27/index.ttl`;
const SAMPLE_CHAT_1_MESSAGE_RESOURCE_2_MESSAGES = [
  {
    "@id": `${SAMPLE_CHAT_1_MESSAGE_RESOURCE_2_URI}#d4d513fa-23e0-4726-89aa-f5e433bb6c58`,
    created2: "2024-11-07T08:52:38.447Z",
    content: "Hi",
    maker: { "@id": "https://juliusisnya.solidcommunity.net/profile/card#me" }
  }
]

describe("integration", () => {
  const s = setupServer(
    3003,
    testFiles,
    path.join(
      __dirname,
      "./configs/components-config/unauthenticatedServer.json",
    ),
    true
  );

  let dataset: ConnectedLdoDataset<SolidConnectedPlugin[]>;
  let sample1Chat: Chat;

  beforeEach(() => {
    dataset = createConnectedLdoDataset([solidConnectedPlugin]);
    sample1Chat = new Chat(SAMPLE_CHAT_1_CONTAINER_URI, dataset);
  });

  afterEach(async () => {
    if (sample1Chat) {
      await sample1Chat.destroy();
    }
  });

  it("Fetches chat information and messages", async () => {
    const chatInfo = await sample1Chat.getChatInfo();
    expect(chatInfo["@id"]).toBe(SAMPLE_CHAT_1_INDEX_INFO["@id"]);
    expect(chatInfo.author).toEqual(SAMPLE_CHAT_1_INDEX_INFO.author);
    expect(chatInfo.created).toBe(SAMPLE_CHAT_1_INDEX_INFO.created);
    expect(chatInfo.title).toBe(SAMPLE_CHAT_1_INDEX_INFO.title);

    const messageIterator = sample1Chat.getMessageIterator();
    const messageGroups: ChatMessageShape[][] = [];
    for await (const item of messageIterator) {
      messageGroups.push(item);
    }
    const messages = messageGroups.flat();
    expect(messages.length).toBe(5);
    expect(messages[0].content).toBe(SAMPLE_CHAT_1_MESSAGE_RESOURCE_2_MESSAGES[0].content);
    expect(messages[1].content).toBe(SAMPLE_CHAT_1_MESSAGE_RESOURCE_1__MESSAGES[0].content);
    expect(messages[2].content).toBe(SAMPLE_CHAT_1_MESSAGE_RESOURCE_1__MESSAGES[1].content);
    expect(messages[3].content).toBe(SAMPLE_CHAT_1_MESSAGE_RESOURCE_1__MESSAGES[2].content);
    expect(messages[4].content).toBe(SAMPLE_CHAT_1_MESSAGE_RESOURCE_1__MESSAGES[3].content);
  });

  it("Creates a new chat and sets the info", async () => {
    const sample2Chat = new Chat(`${BASE_URI}sample-chat-2/`, dataset);
    await sample2Chat.createChat({
      type: { "@id": "LongChat" },
      author: { "@id": WEB_ID },
      created: (new Date()).toISOString(),
      title: "Cool Chat",
    });

    const chatInfo = await sample2Chat.getChatInfo();
    expect(chatInfo.title).toBe("Cool Chat");

    await sample2Chat.setChatInfo({
      title: "Uncool Chat",
    });

    const chatInfo2 = await sample2Chat.getChatInfo();
    expect(chatInfo2.title).toBe("Uncool Chat");    
  });

  it.only("Sends a message to a chat", async () => {
    const sample3Chat = new Chat(`${BASE_URI}sample-chat-3/`, dataset);
    await sample3Chat.createChat({
      type: { "@id": "LongChat" },
      author: { "@id": WEB_ID },
      created: (new Date()).toISOString(),
      title: "Sample3 Chat",
    })

    await sample3Chat.sendMessage("Test Content", WEB_ID);

    const messageIterator = sample3Chat.getMessageIterator();
    const messageGroups: ChatMessageShape[][] = [];
    for await (const item of messageIterator) {
      messageGroups.push(item);
    }
    const messages = messageGroups.flat();
    expect(messages.length).toBe(1);
    expect(messages[0].content).toBe("Test Content");
  });
});
