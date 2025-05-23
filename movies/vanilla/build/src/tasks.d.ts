export type InterpretedComment = {
    uri: string;
    author: string;
    created: Date;
    text: string;
    issueUri: string;
};
export type InterpretedIssue = {
    uri: string;
    author: string;
    title: string;
    created: Date;
    description: string;
    trackerIndexUri: string;
    commentUris: string[];
};
export type InterpretedTracker = {
    indexUri: string;
    stateUri: string;
    author: string;
    created: Date;
    issueClass: string;
    initialState: string;
    assigneeClass: string;
};
export type Interpretation = {
    tracker: InterpretedTracker;
    issues: {
        [uri: string]: InterpretedIssue;
    };
};
export declare function fetchTracker(uri: string, authenticatedFetcher: typeof globalThis.fetch): Promise<Interpretation>;
export declare function addIssue(localState: Interpretation, { title, description }: {
    title: string;
    description: string;
}, authenticatedFetcher: typeof globalThis.fetch): Promise<string>;
export declare function addComment(localState: Interpretation, { issueUri, author, text, }: {
    issueUri: string;
    author: string;
    text: string;
}, authenticatedFetcher: typeof globalThis.fetch): Promise<string>;
