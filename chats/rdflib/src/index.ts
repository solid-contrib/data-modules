import { ChatsModuleRdfLib } from "./module/ChatsModuleRdfLib.js";

export default ChatsModuleRdfLib;

export interface ChatsModule {
  /**
   * Creates a new chat in the given container
   * @param command
   * @return The URI of the newly created chat
   */
  createChat(command: CreateChatCommand): Promise<string>;

  /**
   * Retrieve a given chat's name and latest messages
   * @param chatUri
   */
  readChat(chatUri: string): Promise<Chat>;

  /**
   * Post a new message to an existing chat
   * @param command
   * @return The URI of the newly created message
   */
  postMessage(command: PostMessageCommand): Promise<string>;
}

/**
 * Data needed to create a new chat
 */
export interface CreateChatCommand {
  /**
   * The URI of the target container
   */
  containerUri: string;
  /**
   * The human-readable title for the chat
   */
  name: string;
}

/**
 * Represents an existing chat, and it's list of latest messages
 */
export interface Chat {
  /**
   * URI identifying the chat
   */
  uri: string;
  /**
   * The human-readable title of the chat
   */
  name: string;
  /**
   * A (not-necessarily complete) list of messages in that chat
   */
  latestMessages: Message[];
}

/**
 * Represents a message in a chat
 */
export interface Message {
  /**
   * URI identifying the message
   */
  uri: string;
  /**
   * WebID of the message author
   */
  authorWebId: string;
  /**
   * Text of the message
   */
  text: string;
  /**
   * Date and time the message was posted
   */
  date: Date;
}

/**
 * Data needed to post a new message
 */
export interface PostMessageCommand {
  /**
   * URI of the chat to post to
   */
  chatUri: string;
  /**
   * Text of the message to post
   */
  text: string;
  /**
   * WebID of the message author
   */
  authorWebId: string;
}
