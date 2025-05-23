import { randomUUID } from 'node:crypto';
import { getJsonLdLinkField, getJsonLdId, getJsonLdType, getJsonLdStringField, getJsonLdDateField, getJsonLdStringFieldMulti, } from './jsonld.js';
var IssueState;
(function (IssueState) {
    IssueState["Open"] = "http://www.w3.org/2005/01/wf/flow#Open";
})(IssueState || (IssueState = {}));
function lastWord(str) {
    const slashParts = str.split('/');
    const hashParts = slashParts[slashParts.length - 1].split('#');
    return hashParts[hashParts.length - 1];
}
function isUplink(entry, indexUri, stateUri) {
    // console.log('checking for uplink', getJsonLdId(entry), indexUri, entry['http://www.w3.org/2005/01/wf/flow#stateStore'], stateUri);
    return (getJsonLdId(entry) === indexUri &&
        getJsonLdLinkField(entry, 'http://www.w3.org/2005/01/wf/flow#stateStore') === stateUri);
}
function getIssueState(entry) {
    const typeStr = getJsonLdType(entry);
    // console.log('checking issue state', typeStr);
    if (typeof typeStr === 'string' &&
        typeStr.startsWith('http://www.w3.org/2005/01/wf/flow#')) {
        return typeStr.substring('http://www.w3.org/2005/01/wf/flow#'.length);
    }
    return undefined;
}
function interpret({ index, state, }) {
    const indexUri = getJsonLdId(index[0]);
    const stateUri = getJsonLdLinkField(index[0], 'http://www.w3.org/2005/01/wf/flow#stateStore');
    const ret = {
        tracker: {
            indexUri,
            stateUri,
            author: getJsonLdLinkField(index[0], 'http://purl.org/dc/elements/1.1/author'),
            created: getJsonLdDateField(index[0], 'http://purl.org/dc/elements/1.1/created'),
            issueClass: lastWord(getJsonLdLinkField(index[0], 'http://www.w3.org/2005/01/wf/flow#issueClass')),
            initialState: lastWord(getJsonLdLinkField(index[0], 'http://www.w3.org/2005/01/wf/flow#initialState')),
            assigneeClass: lastWord(getJsonLdLinkField(index[0], 'http://www.w3.org/2005/01/wf/flow#assigneeClass')),
        },
        issues: {},
    };
    const comments = {};
    state.forEach((entry) => {
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
                title: getJsonLdStringField(entry, 'http://purl.org/dc/elements/1.1/title'),
                created: getJsonLdDateField(entry, 'http://purl.org/dc/terms/created'),
                description: getJsonLdStringField(entry, 'http://www.w3.org/2005/01/wf/flow#description'),
                trackerIndexUri: indexUri,
                commentUris: getJsonLdStringFieldMulti(entry, 'http://www.w3.org/2005/01/wf/flow#message'),
            };
            return;
        }
        const comment = {
            author: getJsonLdLinkField(entry, 'http://xmlns.com/foaf/0.1/maker'),
            text: getJsonLdStringField(entry, 'http://rdfs.org/sioc/ns#content'),
            created: getJsonLdDateField(entry, 'http://purl.org/dc/terms/created'),
        };
        console.log(comment);
        if (typeof comment.author === 'string' &&
            typeof comment.text === 'string' &&
            comment.created instanceof Date) {
            // console.log('issue');
            comments[getJsonLdId(entry)] = comment;
            // console.log('comment found', comment);
            return;
        }
        console.error(entry);
        throw new Error('entry not interpreted');
    });
    return ret;
}
export async function fetchTracker(uri, authenticatedFetcher) {
    const indexRet = await authenticatedFetcher(uri, {
        headers: {
            Accept: 'application/ld+json',
        },
    });
    const index = await indexRet.json();
    const stateDocUri = index[0]['http://www.w3.org/2005/01/wf/flow#stateStore'][0]['@id'];
    const stateRet = await authenticatedFetcher(stateDocUri, {
        headers: {
            Accept: 'application/ld+json',
        },
    });
    const state = await stateRet.json();
    return interpret({ index, state });
}
export async function addIssue(localState, { title, description }, authenticatedFetcher) {
    const id = `${localState.tracker.stateUri}#Iss${randomUUID()}`;
    console.log(localState.tracker.stateUri, title, description, typeof authenticatedFetcher);
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
export async function addComment(localState, { issueUri, author, text, }, authenticatedFetcher) {
    const id = `${localState.tracker.stateUri}#Msg${randomUUID()}`;
    console.log(localState.tracker.stateUri, author, text, typeof authenticatedFetcher);
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
//# sourceMappingURL=tasks.js.map