import 'dotenv/config';
import { v7 } from 'css-authn';
import { fetchTracker, Interpretation, addIssue, addComment } from './main.js';

const authenticatedFetch = await v7.getAuthenticatedFetch({
  email: process.env.SOLID_EMAIL,
  password: process.env.SOLID_PASSWORD,
  provider: process.env.SOLID_SERVER,
});
const trackerUrl = 'https://michielbdejong.solidcommunity.net/tasks/index.ttl#this';
const localState: Interpretation = await fetchTracker(trackerUrl, authenticatedFetch);
const issueUri = await addIssue(localState, {
    title: 'Use the Solid Data Module for Tasks',
    description: 'Solid app devs should not be rolling their own task tracker access code.',
}, authenticatedFetch);
const newComment = {
  issueUri,
  author: 'https://michielbdejong.solidcommunity.net/profile/card#me',
  text: `I totally agree at ${new Date().toUTCString()}`,
};
const commentUri = await addComment(localState, newComment, authenticatedFetch);
console.log(commentUri);
