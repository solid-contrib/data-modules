import { ChatsModuleRdfLib } from "./module/ChatsModuleRdfLib.js";

export default ChatsModuleRdfLib;


export interface ChatsModule {

  /**
   * Creates a new chat in the given container
   * @param command
   * @return The URI of the newly created chat
   */
  createChat(command: CreateChatCommand): string
}

/**
 * Data needed to create a new chat
 */
export interface CreateChatCommand {
  /**
   * The URI of the target container
   */
  containerUri: string,
  /**
   * The human-readable title for the chat
   */
  name: string,
}