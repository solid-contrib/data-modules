import { Fetch } from "soukai-solid";

export interface ISoukaiDocumentBase {
  url: string;
}
export interface GetInstanceArgs {
  webId: string;
  fetch?: Fetch;
  isPrivate?: boolean;
}
