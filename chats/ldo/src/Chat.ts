import { ConnectedLdoDataset } from "@ldo/connected";
import { SolidConnectedPlugin, SolidContainer, SolidContainerUri, SolidLeaf, SolidLeafUri, SolidResource } from "@ldo/connected-solid";
import { ChatMessageShape, ChatShape } from "./.ldo/longChat.typings.js";
import { scheduleNewDayTrigger } from "./util/scheduleNewDayTrigger.js";
import { ChatMessageListShapeShapeType, ChatMessageShapeShapeType, ChatShapeShapeType } from "./.ldo/longChat.shapeTypes.js";
import { getResource, throwIfErr, throwIfErrOrAbsent } from "./util/resultHelpers.js";
import { v4 } from "uuid";
import { namedNode } from "@ldo/rdf-utils";
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
    if (mostRecentMessage)
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
    ): SolidContainer | undefined => {
      const sorted = [...list]
        .filter((item): item is SolidContainer => item.type === "SolidContainer")
        .sort((a, b) => a.uri.localeCompare(b.uri));
      const sliced = sorted.slice(0, sorted.findIndex(i => i.uri === target.uri));
      
      return sliced.pop();
    }

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
      throwIfErrOrAbsent(await indexResource.readIfUnfetched());
      return indexResource;
    };

    const drillDownMostRecent = async (
      container: SolidContainer,
      levels: number
    ): Promise<SolidLeaf | undefined> => {
      if (levels === 0) return getIndexIfExists(container);
      throwIfErrOrAbsent(await container.readIfUnfetched());
      const mostRecent = getMostRecentContainer(container.children());
      if (!mostRecent) return undefined;
      return drillDownMostRecent(mostRecent, levels - 1);
    };

    let container = await currentResource.getParentContainer(); // Day
    const levelNames = ["Month", "Year", "Eternity"]; // Logical structure
    for (let depth = 0; depth < levelNames.length; depth++) {
      const parent = await container.getParentContainer() as SolidContainer;
      throwIfErrOrAbsent(await parent.readIfUnfetched());
      const previous = getPreviousContainer(parent.children(), container);
      if (previous) {
        throwIfErrOrAbsent(await previous.readIfUnfetched());
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
      console.log(this.todaysMessageResource!.isPresent());
      this.internalCallback = () => {
        console.log("Callback Called:", this.todaysMessageResource!);
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
      this.subscriptionId = await this.todaysMessageResource!
        .subscribeToNotifications({
          onNotification: this.internalCallback.bind(this),
        });
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
  }

  /**
   * Returns the messages in a resource sorted in order of most recent to least
   * recent
   * @param resource 
   */
  private getMessagesForMessageResource(resource: SolidLeaf): ChatMessageShape[] {
    const chatMessageList = this.dataset
      .usingType(ChatMessageShapeShapeType)
      .matchObject(
        `${this.chatResource.uri}#this`,
        "http://www.w3.org/2005/01/wf/flow#message",
        `${resource.uri}`);
    return chatMessageList.toArray()
      .sort((a, b) => b.created2.localeCompare(a.created2)) ?? [];
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
    const result = throwIfErrOrAbsent(await this.chatResource.readIfUnfetched());

    return this.dataset.usingType(ChatShapeShapeType)
      .fromSubject(`${this.chatResource.uri}#this`);
  }

  public async setChatInfo(chatInfo: Partial<ChatShape>): Promise<void> {
    await this.chatResource.readIfUnfetched();

    const chatInfoTransaction = this.dataset
      .startTransaction()
    const cChatInfo = chatInfoTransaction
      .usingType(ChatShapeShapeType)
      .write(this.chatResource.uri)
      .fromSubject(`${this.chatResource.uri}#this`);
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
      .fromSubject(`${this.chatResource.uri}#this`);

    const messageDate = new Date().toISOString();

    cChatMessageList.message?.add({
      "@id": `${this.todaysMessageResource!.uri}#${v4()}`,
      content,
      maker: { "@id": makerWebId },
      created2: messageDate,
    });

    const result = throwIfErr(await messageTransaction.commitToRemote());
    this.mostRecentMessageDate = messageDate;
  }

  /**
   * Returns an iterator to fetch paginated messages.
   * @returns 
   */
  public getMessageIterator(): AsyncGenerator<ChatMessageShape[]> {
    const self = this;

    async function* messageGenerator(): AsyncGenerator<ChatMessageShape[]> {
      await self.ensureTodaysMessageResource();
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