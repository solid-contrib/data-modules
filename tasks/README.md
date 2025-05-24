## Tasks Data Module

To use this Solid Data Module you need an authenticated fetch function. In Node.JS, when working against a CSS or Pivot server such as solidcommnunity.net, you can use [css-authn](https://www.npmjs.com/package/css-authn#usage) for this. In the browser, you can use [Inrupt Solid Client](https://docs.inrupt.com/developer-tools/javascript/client-libraries/authentication/).

Data schemas supported:
* Solid OS Issue Pane
* [Solid Hello World](https://hello.0data.app/solid/)

### Usage
Set up a typescript project, install [solid-data-module-tasks](https://www.npmjs.com/package/solid-data-module-tasks) from NPM, and create a `.env` file like this:
```env
SOLID_SERVER=https://solidcommunity.net
SOLID_EMAIL=michielbdejong@users.css.pod
SOLID_PASSWORD=...
```

Edit line 9 of `node_modules/solid-data-module-tasks/build/src/example.js` to point to a folder
where you can create a Solid OS issue tracker (through the Solid OS web interface of solidcommunity.net for instance) and a 0data issue tracker through [Solid Hello World](https://hello.0data.app/solid/).

If you now run `node node_modules/solid-data-module-tasks/build/src/example.js` you will see a list of issues that is combined from your 0data issue tracker and your Solid OS issue tracker at that same URL.

You can also save, build and run the following TypeScript file:
```ts
import 'dotenv/config';
import { v7 } from 'css-authn';
import { fetchTracker, Interpretation, addIssue, addComment } from 'solid-data-module-tasks';

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
```

This will result in an issue and a comment being created in that tracker:
![screenshot](https://github.com/user-attachments/assets/8d0a1aef-94c8-4c41-848d-d21edfe5f116)