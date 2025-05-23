import { ConnectedLdoDataset } from "@ldo/connected";
import { SolidConnectedPlugin, SolidContainer, SolidContainerUri, SolidLeaf, SolidLeafUri, SolidResource } from "@ldo/connected-solid";
import { ChatMessageShape, ChatShape } from "./.ldo/longChat.typings";
import { scheduleNewDayTrigger } from "./util/scheduleNewDayTrigger";
import { ChatMessageListShapeShapeType, ChatMessageShapeShapeType, ChatShapeShapeType } from "./.ldo/longChat.shapeTypes";
import { getResource, throwIfErr } from "./util/resultHelpers";
import { v4 } from "uuid";
import { namedNode } from "@rdfjs/data-model";

export class Chat {
  public readonly containerResource: SolidContainer;
  public readonly chatResource: SolidLeaf;
  public todaysMessageResource?: SolidLeaf;
  private dataset: ConnectedLdoDataset<SolidConnectedPlugin[]>;

  private mostRecentMessageDate: string = new Date(0).toISOString();

  // Subscription Information
  private subscriptionCallback?: (message: ChatMessageShape[]) => void;
  private subscriptionId?: string;

  private clearNewDayTrigger?: () => void;
  private internalCallback?: () => void;

  constructor(
    containerUri: SolidContainerUri,
    dataset: ConnectedLdoDataset<SolidConnectedPlugin[]>
  ) {
    this.containerResource = dataset.getResource(containerUri);
    this.chatResource = this.containerResource.child("index.ttl");
    this.dataset = dataset;
    this.clearNewDayTrigger = scheduleNewDayTrigger(this.onNewDay.bind(this));
  }

  /**
   * ===========================================================================
   * HELPERS
   * ===========================================================================
   */

  private async onNewDay(): Promise<void> {
    // Unsubscribe from the previous day's resource
    await this.endNotificationSubscription();
    // Create a new document for today
    this.todaysMessageResource = await this.getOrCreateTodaysMessageResource();
    // Subscribe to it if a subscription exists
    await this.startNotificationSubscription();

  }

  /**
   * Gets the resource for today's messages. If it doesn't exist, create it.
   */
  private async getOrCreateTodaysMessageResource(): Promise<SolidLeaf> {
    // Get Todays date
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();

    // Year
    const yearResource = getResource(
      await this.containerResource.createChildIfAbsent(`${year}/`)
    );

    // Month
    const monthResource = getResource(
      await yearResource.createChildIfAbsent(`${month}/`)
    );

    // Day
    const dayResource = getResource(
      await monthResource.createChildIfAbsent(`${day}/`)
    );

    // Index
    const indexResource = getResource(
      await dayResource.createChildIfAbsent(`index.ttl`)
    );

    return indexResource;
  }

  /**
   * Ensures today's message resource is identified
   */
  private async ensureTodaysMessageResource(): Promise<SolidLeaf> {
    if (this.todaysMessageResource) return this.todaysMessageResource;
    this.todaysMessageResource = await this.getOrCreateTodaysMessageResource();

    // Set the most recent message time
    const [mostRecentMessage] = this.getMessagesForMessageResource(
      this.todaysMessageResource
    );
    this.mostRecentMessageDate = mostRecentMessage.created2;

    return this.todaysMessageResource;
  }

  /**
   * Given a message resource, find the message resource that is chronologically
   * previous to this one. Return undefined if there is none.
   * @param currentResource 
   */
  private async getPreviousMessageResource(
    currentResource: SolidLeaf
  ): Promise<SolidLeaf | undefined> {
    const getPreviousContainer = (
      list: (SolidContainer | SolidResource)[],
      target: SolidContainer
    ): SolidContainer | undefined =>
      [...list]
        .filter((item): item is SolidContainer => item.type === "SolidContainer")
        .sort((a, b) => a.uri.localeCompare(b.uri))
        .slice(0, list.findIndex(i => i.uri === target.uri))
        .pop();

    const getMostRecentContainer = (
      list: (SolidContainer | SolidResource)[]
    ): SolidContainer | undefined =>
      [...list]
        .filter((item): item is SolidContainer => item.type === "SolidContainer")
        .sort((a, b) => a.uri.localeCompare(b.uri))
        .pop();

    const getIndexIfExists = async (
      container: SolidContainer
    ): Promise<SolidLeaf | undefined> => {
      const indexResource = container.child("index.ttl");
      throwIfErr(await indexResource.readIfUnfetched());
      return indexResource;
    };

    const drillDownMostRecent = async (
      container: SolidContainer,
      levels: number
    ): Promise<SolidLeaf | undefined> => {
      if (levels === 0) return getIndexIfExists(container);
      throwIfErr(await container.readIfUnfetched());
      const mostRecent = getMostRecentContainer(container.children());
      if (!mostRecent) return undefined;
      return drillDownMostRecent(mostRecent, levels - 1);
    };

    let container = await currentResource.getParentContainer(); // Day
    const levelNames = ["Month", "Year", "Eternity"]; // Logical structure
    for (let depth = 0; depth < levelNames.length; depth++) {
      const parent = await container.getParentContainer() as SolidContainer;
      throwIfErr(await parent.readIfUnfetched());
      const previous = getPreviousContainer(parent.children(), container);
      if (previous) {
        throwIfErr(await previous.readIfUnfetched());
        return drillDownMostRecent(previous, depth); // Drill into [day, month, year]
      }
      container = parent;
    }

    return undefined;
  }


  /**
   * Begins notification subscription with today's message resource
   */
  private async startNotificationSubscription() {
    await this.ensureTodaysMessageResource();
    if (this.subscriptionCallback) {
      this.subscriptionId = await this.todaysMessageResource!
        .subscribeToNotifications();
      // Set up a callback when a new message is coming in
      this.internalCallback = () => {
        const messages = this.getMessagesForMessageResource(
          this.todaysMessageResource!
        );
        const newMessages = messages.filter((message) => {
          return message.created2 > this.mostRecentMessageDate;
        });
        if (newMessages.length > 0) {
          this.mostRecentMessageDate = newMessages[0].created2;
          this.subscriptionCallback?.(newMessages);
        }
      }
      this.dataset.on(
        [null, null, null, namedNode(this.todaysMessageResource!.uri)],
        this.internalCallback.bind(this)
      )
    }
  }

  /**
   * Ends notification subscription with today's message resource
   */
  private async endNotificationSubscription() {
    await this.ensureTodaysMessageResource();
    if (this.subscriptionId) {
      await this.todaysMessageResource!
        .unsubscribeFromNotifications(this.subscriptionId);
      this.subscriptionId = undefined;
    }
    if (this.internalCallback)
      this.dataset.removeListenerFromAllEvents(this.internalCallback);
  }

  /**
   * Returns the messages in a resource sorted in order of most recent to least
   * recent
   * @param resource 
   */
  private getMessagesForMessageResource(resource: SolidLeaf): ChatMessageShape[] {
    const chatMessageList = this.dataset
      .usingType(ChatMessageListShapeShapeType)
      .fromSubject(`${resource}#this`);
    return chatMessageList
      .message?.toArray()
      .sort((a, b) => a.created2.localeCompare(b.created2)) ?? [];
  }

  /**
   * ===========================================================================
   * PUBLIC METHODS
   * ===========================================================================
   */

  /**
   * Creates a chat. Throws an error if it already esists
   * @param chatInfo
   */
  public async createChat(chatInfo: ChatShape): Promise<void> {
    const createResult = throwIfErr(await this.chatResource.createIfAbsent());
    if (createResult.type !== "createSuccess")
      throw new Error("Could not create chat. Chat already exists");
    await this.setChatInfo(chatInfo);
  }

  /**
   * Gets a chat's info
   * @returns 
   */
  public async getChatInfo(): Promise<ChatShape> {
    throwIfErr(await this.chatResource.readIfUnfetched());

    return this.dataset.usingType(ChatShapeShapeType)
      .fromSubject(this.chatResource.uri);
  }

  public async setChatInfo(chatInfo: Partial<ChatShape>): Promise<void> {
    await this.chatResource.readIfUnfetched();

    const chatInfoTransaction = this.dataset
      .startTransaction()
    const cChatInfo = chatInfoTransaction
      .usingType(ChatShapeShapeType)
      .write(this.chatResource.uri)
      .fromSubject(this.chatResource.uri);
    Object.assign(cChatInfo, chatInfo);
    throwIfErr(await chatInfoTransaction.commitToRemote());
  }

  /**
   * Deletes this chat
   */
  public async deleteChat(): Promise<void> {
    await this.endNotificationSubscription();
    throwIfErr(await this.containerResource.delete());
  }

  /**
   * Deletes the given message
   * @param messageId 
   */
  public async removeMessage(messageId: string): Promise<void> {
    const messageTransaction = this.dataset
      .startTransaction()
    const cMessage = messageTransaction
      .usingType(ChatMessageShapeShapeType)
      .fromSubject(messageId);
    delete cMessage["@id"];
    throwIfErr(await messageTransaction.commitToRemote());
  }

  /**
   * Sends a message to the chat
   * @param content 
   * @param makerWebId 
   */
  public async sendMessage(content: string, makerWebId: string): Promise<void> {
    await this.ensureTodaysMessageResource();
    const messageTransaction = this.dataset
      .startTransaction()
    const cChatMessageList = messageTransaction
      .usingType(ChatMessageListShapeShapeType)
      .write(this.todaysMessageResource!.uri)
      .fromSubject(`${this.todaysMessageResource!.uri}#this`);

    cChatMessageList.message?.add({
      "@id": `${this.todaysMessageResource!.uri}#${v4()}`,
      content,
      maker: { "@id": makerWebId },
      created2: new Date().toISOString(),
    })

    throwIfErr(await messageTransaction.commitToRemote());
  }

  /**
   * Returns an iterator to fetch paginated messages.
   * @returns 
   */
  public getMessageIterator(): AsyncIterator<ChatMessageShape[]> {
    const self = this;

    async function* messageGenerator(): AsyncGenerator<ChatMessageShape[]> {
      let currentResource: SolidLeaf | undefined = self.todaysMessageResource;

      while (currentResource) {
        const messages = self.getMessagesForMessageResource(currentResource);
        yield messages;

        currentResource = await self.getPreviousMessageResource(currentResource);
      }
    }

    return messageGenerator();
  }

  /**
   * Subscribe to new incoming messages for this chat
   * @param callback
   * @returns 
   */
  public async subscribeToMessages(
    callback: (message: ChatMessageShape[]) => void
  ): Promise<void> {
    // If Subscription Callback already exists, simply update it and continue
    // the subscription
    if (this.subscriptionCallback) {
      this.subscriptionCallback = callback;
      return;
    }
    this.subscriptionCallback = callback;
    // Begin subscription
    await this.startNotificationSubscription();
  }

  /**
   * Unsubscribe from notifications
   */
  public async unsubscribeFromMessages(): Promise<void> {
    this.subscriptionCallback = undefined;
    await this.endNotificationSubscription();
  }

  /**
   * Call this before destroying the class to clean up listeners.
   */
  public async destroy(): Promise<void> {
    this.clearNewDayTrigger?.();
    await this.endNotificationSubscription();
  }
}