import { IConnectedLdoDataset } from "@ldo/connected";
import { SolidConnectedPlugin } from "@ldo/connected-solid";
import { ChatMessageShape, ChatShape } from "./.ldo/longChat.typings";

export class Chat {
  public readonly uri: string;
  private dataset: IConnectedLdoDataset<SolidConnectedPlugin[]>;
  private chatMessageLists: string[];
  private subscriptionCallback: (message: ChatMessageShape) => {};

  constructor(
    uri: string,
    dataset: IConnectedLdoDataset<SolidConnectedPlugin[]>
  ) {
    this.uri = uri;
    this.dataset = dataset;
  }

  public async getChatInfo(): Promise<ChatShape> {
    throw new Error("Unimplemented");
  }

  public async setChatInfo(chatInfo: Partial<ChatShape>): Promise<void> {
    throw new Error("Unimplemented");
  }

  public async deleteChat(): Promise<void> {
    throw new Error("Unimplemented");
  }

  public async removeMessage(messageId: string): Promise<void> {
    throw new Error("Unimplemented");
  }

  public async createMessage(message: ChatMessageShape): Promise<void> {
    throw new Error("Unimplemented");
  }

  public async sendMessage(content: string, makerWebId: string): Promise<void> {
    throw new Error("Unimplemented");
  }

  public getMessageIterator(): AsyncIterator<ChatMessageShape[]> {
    throw new Error("Unimplemented");
  }

  public async subscribeToMessages(
    callback: (message: ChatMessageShape) => void
  ): Promise<void> {
    throw new Error("Unimplemented");
  }

  public async unsubscribeFromMessages(): Promise<void> {
    throw new Error("Unimplemented");
  }
}