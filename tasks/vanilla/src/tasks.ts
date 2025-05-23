import { randomUUID } from 'node:crypto';
import {
  getJsonLdLinkField,
  getJsonLdId,
  getJsonLdType,
  getJsonLdStringField,
  getJsonLdDateField,
  getJsonLdStringFieldMulti,
} from './jsonld.js';

type Link = [
  {
    '@id': string;
  },
];
type Val<T> = [
  {
    '@value': string;
    '@type': T;
  },
];
enum IssueState {
  Open = 'http://www.w3.org/2005/01/wf/flow#Open',
}

type Issue = {
  '@id': string; // issue URI
  'http://www.w3.org/2005/01/wf/flow#tracker': [{ '@id': string }]; // index URI
  'http://purl.org/dc/elements/1.1/title': [{ '@value': string }];
  'http://purl.org/dc/terms/created': [
    {
      '@value': string;
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime';
    },
  ];
  '@type': IssueState[];
  'http://www.w3.org/2005/01/wf/flow#description': [
    {
      '@value': string; // description
    },
  ];
  'http://www.w3.org/2005/01/wf/flow#message': [
    {
      '@id': 'https://michielbdejong.solidcommunity.net/tasks/state.ttl#Msg1747305825057';
    },
  ];
};
type IssueComment = {
  '@id': string;
  'http://purl.org/dc/terms/created': [
    {
      '@value': string;
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime';
    },
  ];
  'http://rdfs.org/sioc/ns#content': [
    {
      '@value': string;
    },
  ];
  'http://xmlns.com/foaf/0.1/maker': [
    {
      '@id': string;
    },
  ];
};

type UpLink = {
  '@id': string; // index URI
  'http://www.w3.org/2005/01/wf/flow#stateStore': [{ '@id': string }]; // state URI
};

type TrackerIndex = [
  {
    '@id': string;
    '@type': ['http://www.w3.org/2005/01/wf/flow#Tracker'];
    'http://purl.org/dc/elements/1.1/author': Link;
    'http://www.w3.org/2005/01/wf/flow#issueClass': Link;
    'http://www.w3.org/2005/01/wf/flow#initialState': Link;
    'http://www.w3.org/2005/01/wf/flow#stateStore': Link;
    'http://www.w3.org/2005/01/wf/flow#assigneeClass': Link;
    'http://purl.org/dc/elements/1.1/created': Val<'http://www.w3.org/2001/XMLSchema#dateTime'>;
  },
];

type TrackerStateEntry = UpLink | Issue | IssueComment;
type TrackerState = TrackerStateEntry[];

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

function lastWord(str: string): string {
  const slashParts = str.split('/');
  const hashParts = slashParts[slashParts.length - 1].split('#');
  return hashParts[hashParts.length - 1];
}

function isUplink(entry: object, indexUri: string, stateUri: string): boolean {
  // console.log('checking for uplink', getJsonLdId(entry), indexUri, entry['http://www.w3.org/2005/01/wf/flow#stateStore'], stateUri);
  return (
    getJsonLdId(entry) === indexUri &&
    getJsonLdLinkField(
      entry,
      'http://www.w3.org/2005/01/wf/flow#stateStore',
    ) === stateUri
  );
}

function getIssueState(entry: object): string | undefined {
  const typeStr = getJsonLdType(entry);
  // console.log('checking issue state', typeStr);
  if (
    typeof typeStr === 'string' &&
    typeStr.startsWith('http://www.w3.org/2005/01/wf/flow#')
  ) {
    return typeStr.substring('http://www.w3.org/2005/01/wf/flow#'.length);
  }
  return undefined;
}

function interpret({
  index,
  state,
}: {
  index: TrackerIndex;
  state: TrackerState;
}): Interpretation {
  const indexUri = getJsonLdId(index[0]);
  const stateUri = getJsonLdLinkField(
    index[0],
    'http://www.w3.org/2005/01/wf/flow#stateStore',
  );
  const ret = {
    tracker: {
      indexUri,
      stateUri,
      author: getJsonLdLinkField(
        index[0],
        'http://purl.org/dc/elements/1.1/author',
      ),
      created: getJsonLdDateField(
        index[0],
        'http://purl.org/dc/elements/1.1/created',
      ),
      issueClass: lastWord(
        getJsonLdLinkField(
          index[0],
          'http://www.w3.org/2005/01/wf/flow#issueClass',
        ),
      ),
      initialState: lastWord(
        getJsonLdLinkField(
          index[0],
          'http://www.w3.org/2005/01/wf/flow#initialState',
        ),
      ),
      assigneeClass: lastWord(
        getJsonLdLinkField(
          index[0],
          'http://www.w3.org/2005/01/wf/flow#assigneeClass',
        ),
      ),
    },
    issues: {},
  };
  const comments: {
    [uri: string]: InterpretedComment;
  } = {};
  state.forEach((entry: TrackerStateEntry) => {
    // console.log('state entry', JSON.stringify(entry, null, 2));
    if (isUplink(entry, indexUri, stateUri)) {
      // console.log('uplink found');
      return;
    }
    const issueState = getIssueState(entry);
    if (typeof issueState === 'string') {
      // console.log('issue');
      ret.issues[getJsonLdId(entry)] = {
        // tracker: getJsonLdLinkField(entry, 'http://www.w3.org/2005/01/wf/flow#tracker'),
        title: getJsonLdStringField(
          entry,
          'http://purl.org/dc/elements/1.1/title',
        ),
        created: getJsonLdDateField(entry, 'http://purl.org/dc/terms/created'),
        description: getJsonLdStringField(
          entry,
          'http://www.w3.org/2005/01/wf/flow#description',
        ),
        trackerIndexUri: indexUri,
        commentUris: getJsonLdStringFieldMulti(
          entry,
          'http://www.w3.org/2005/01/wf/flow#message',
        ),
      } as InterpretedIssue;
      return;
    }
    const comment = {
      author: getJsonLdLinkField(entry, 'http://xmlns.com/foaf/0.1/maker'),
      text: getJsonLdStringField(entry, 'http://rdfs.org/sioc/ns#content'),
      created: getJsonLdDateField(entry, 'http://purl.org/dc/terms/created'),
    };
    console.log(comment);
    if (
      typeof comment.author === 'string' &&
      typeof comment.text === 'string' &&
      comment.created instanceof Date
    ) {
      // console.log('issue');
      comments[getJsonLdId(entry)] = comment as InterpretedComment;
      // console.log('comment found', comment);
      return;
    }
    console.error(entry);
    throw new Error('entry not interpreted');
  });
  return ret;
}

export async function fetchTracker(
  uri: string,
  authenticatedFetcher: typeof globalThis.fetch,
): Promise<Interpretation> {
  const indexRet = await authenticatedFetcher(uri, {
    headers: {
      Accept: 'application/ld+json',
    },
  });
  const index: TrackerIndex = await indexRet.json();
  const stateDocUri =
    index[0]['http://www.w3.org/2005/01/wf/flow#stateStore'][0]['@id'];
  const stateRet = await authenticatedFetcher(stateDocUri, {
    headers: {
      Accept: 'application/ld+json',
    },
  });
  const state: TrackerState = await stateRet.json();
  return interpret({ index, state });
}

export async function addIssue(
  localState: Interpretation,
  { title, description }: { title: string; description: string },
  authenticatedFetcher: typeof globalThis.fetch,
): Promise<string> {
  const id = `${localState.tracker.stateUri}#Iss${randomUUID()}`;
  console.log(
    localState.tracker.stateUri,
    title,
    description,
    typeof authenticatedFetcher,
  );
  const inserts = [
    `<${id}> a <http://www.w3.org/2005/01/wf/flow#Open>.`,
    `<${id}> <http://www.w3.org/2005/01/wf/flow#tracker> <${localState.tracker.indexUri}>.`,
    `<${id}> <http://purl.org/dc/elements/1.1/title> "${title}".`,
    `<${id}> <http://www.w3.org/2005/01/wf/flow#description> "${description}".`,
    `<${id}> <http://purl.org/dc/terms/created> "${new Date().toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>.`,
  ];
  const body = `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
<>
  a solid:InsertDeletePatch;
  solid:inserts {
  ${inserts.join('\n')}
}.`;
  const ret = await authenticatedFetcher(localState.tracker.stateUri, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'text/n3',
    },
    body,
  });
  console.log(ret.status);
  return id;
}

export async function addComment(
  localState: Interpretation,
  {
    issueUri,
    author,
    text,
  }: { issueUri: string; author: string; text: string },
  authenticatedFetcher: typeof globalThis.fetch,
): Promise<string> {
  const id = `${localState.tracker.stateUri}#Msg${randomUUID()}`;
  console.log(
    localState.tracker.stateUri,
    author,
    text,
    typeof authenticatedFetcher,
  );
  const inserts = [
    `<${issueUri}> <http://www.w3.org/2005/01/wf/flow#message> <${id}>.`,
    `<${id}> <http://xmlns.com/foaf/0.1/maker> <${author}>.`,
    `<${id}> <http://rdfs.org/sioc/ns#content> "${text}".`,
    `<${id}> <http://purl.org/dc/terms/created> "${new Date().toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>.`,
  ];
  const body = `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
<>
  a solid:InsertDeletePatch;
  solid:inserts {
  ${inserts.join('\n')}
}.`;
  const ret = await authenticatedFetcher(localState.tracker.stateUri, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'text/n3',
    },
    body,
  });
  console.log(ret.status);
  return id;
}
