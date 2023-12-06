# Milestones for the Solid Data Modules project
## Overview
Modules: 6+2+2+2+4+2=18
* M1 bookmarks 6k Reza
* M2 contacts core 2k Angelo
* M3 contacts groups 2k Angelo
* M4 contacts completion 2k Angelo
* M5 chat 4k Jackson
* M6 maps 2k Reza

Paradigms:3+3+3=9
* P1 Soukai-Solid 3k Reza
* P2 rdflib.js 3k Angelo
* P3 LDO 3k Jackson

Foundational: 3+4+3=10
* F1 code generation 3k Jackson
* F2 rs.js Solid backend 4k Yashar
* F3 LDO improvements 3k Jackson

Ecosystem: 1+3+(3 * 1)+(3 * 2)=13
* E1 solidcommunity.net 1k Mahdi
* E2 add Slack bridge to chat 3k Yashar+Reza
* E3 Android1 1k Erfan
* E4 Android2 1k Erfan
* E5 Android3 1k Erfan
* E6 Outreach1 2k Rosano
* E7 Outreach2 2k Rosano
* E8 Outreach3 2k Rosano

Sanity check: 18+9+10+13=50

Per person: 13+9+11+7+6+3+1=50
* Jackson: 4+3+3+3=13
* Angelo: 2+2+2+3=9
* Reza: 6+2+3=11
* Yashar: 4+3=7
* Rosano: 3*2=6
* Erfan: 3*1=3
* Mahdi: 1
  
### M1. Bookmarks module (6k)
We will produce the vanilla version of the Solid data module for bookmarks.
This milestone includes the learning curve of team member Reza Soltani who spent the first few weeks
in the project getting to understand Solid app development and getting ready to write a data module.
See https://github.com/solid-contrib/data-modules#paradigms-covered for an explanation of "vanilla version".
See https://github.com/solid-contrib/data-modules/issues/6 for more details about this milestone.

### M2. Addressbook module core 2k
Core functionality for rdflib contacts module (address books and contacts).

### M3. Addressbook module groups 2k
Add group management

### M4. Addressbook module completion 2k
Type index support, optional features and work in developer feedback

### M5. Chat module 4k
A module for reading and writing chat messages, compatible with both SolidOS LongChat and Liqid Chat.

### M6. Maps module 2k
A module for dealing with maps, location, and other geographical information. This milestone includes only the vanilla version of this module.
See https://github.com/solid-contrib/data-modules/issues/8.

### P1. Modules for Soukai-Solid 3k
All modules also available for for the Soukai-Solid paradigm

### P2. Modules for rdflib.js 3k
All modules also available for for the rdflib.js paradigm (or at least create foundation for rdflib modules other than contacts)

### P3. Modules for LDO 3k
All modules also available for for the LDO paradigm

### F1. Code generation 4k
A tool for generating new (partial) Solid data modules, using automated code generation, starting from a shape definition.

### F2. Solid backend for remoteStorage.js 4k
The remoteStorage.js library currently supports three backends for personal data storage: accounts at (possibly self-hosted) remoteStorage servers, Dropbox accounts,
and Google Drive accounts. We want to add Solid pods as a fourth backend to this library. This will involve some work on the login widget,
triggering the authentication flow, and accessing the pod for create/read/update/delete of files.

### F3. LDO improvements 5k
- Add feature to @ldo/solid to suggest new URIs based on the type index. This must be documented on ldo.js.org and published to NPM.
- Add feature to @ldo/solid to iterate through everything of a certain type in the type index. This must be documented on ldo.js.org and published to NPM.
- Add hook(s) for type-index support in @ldo/solid-react. This must be documented on ldo.js.org and published to NPM.
- Add a new command to @ldo/cli to generate an NPM project that can be published to NPM. This command must be documented on ldo.js.org and published to NPM.
- Add support for common ShEx use cases (Or Type, And Type, Different Cardinalities on identical field in different shapes). This task will require a refactor of the @ldo/type-traverser, @ldo/schema-converter-shex, but it will allow for many more kinds of ShEx shapes to be parsed.
- Add support for Webhooks in @ldo/solid

### E1. solidcommunity.net NSS->CSS migration and server admin 1k
To help app developers make use of our modules, it is useful if our test server, solidcommunity.net, is updated to the latest code and we make sure
the server is running reliably again, without memory leaks and restarts.

### E2. Solid Chat - Slack Bridge 2k
A bridge that adds Slack's API as a data format in the chat data module, and can move data between a Slack chat channel and a Solid chat channel,
and vice versa. This is an extension to the chat data module that shows how it can be used in practice to achieve real-time liquid data between
different schemas for the same type of data.

### E3. Solid library for Java-Android 1k
The Inrupt Solid library for Java has some dependencies that are not available. In this milestone we will deliver a version of it that works with Android.

### E4. Solid hello-world application for Android 1k
Android app with a simple login and selecting the storage

### E5. Solid Data modules in Java 1k
The app from E4 to expose APIs as a service to other Android apps on the same device.

### E6. Conventions archive 2k
Survey apps from the Solid ecosystem and beyond for what data is persisted to the personal data store; document schemas and sample data.

### E7. Landscape summary 2k
Reach out to developers to discover roadblocks to interoperability, document findings in a public text.

### E8. Case study 2k
Publish a working software demonstration of how interoperability could function between multiple schemas or personal data stores.
