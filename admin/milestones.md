# Milestones for the Solid Data Modules project
#### Overview by topic
* modules: `3+4+4+2=12`
* paradigms: `3+3+3+3=12`
* foundational: `4+4+6=14`
* ecosystem: `1+2+3*1+3*2=12`

Sanity check: 12+12+14+12=50

#### Overview by team member
* Jackson: M3, P4, F1, F3 = 14k
* Angelo: M2, P2, P3 = 10k
* Reza: M1, M4, P1 = 8k
* Yashar: F2, E2 = 6k
* Rosano: E6, E7, E8 = 6k
* Erfan: E3, E4, E5 = 3k
* Mahdi: E1, E2 = 3k

Sanity check: 14+10+8+6+6+3+3=50
  
### M1. Bookmarks module (3k)
We will produce the vanilla version of the Solid data module for bookmarks.
See https://github.com/solid-contrib/data-modules#paradigms-covered for an explanation of "vanilla version".
See https://github.com/solid-contrib/data-modules/issues/6 for more details about this milestone.

### M2. Addressbook module 4k
A module for dealing with contacts and addressbooks.

### M3. Chat module 4k
A module for reading and writing chat messages, compatible with both SolidOS LongChat and Liqid Chat.

### M4. Maps module 2k
A module for dealing with maps, location, and other geographical information. This milestone includes only the vanilla version of this module.
See https://github.com/solid-contrib/data-modules/issues/8.

### P1. Modules for Soukai-Solid 3k
All modules also available for for the Soukai-Solid paradigm

### P2. Modules for remoteStorage.js 3k
All modules also available for for the remoteStorage.js paradigm

### P3. Modules for rdflib.js 3k
All modules also available for for the rdflib.js paradigm

### P4. Modules for LDO 3k
All modules also available for for the LDO paradigm

### F1. Code generation 4k
A tool for generating new (partial) Solid data modules, using automated code generation, starting from a shape definition.

### F2. Solid backend for remoteStorage.js 4k
The remoteStorage.js library currently supports three backends for personal data storage: accounts at (possibly self-hosted) remoteStorage servers, Dropbox accounts,
and Google Drive accounts. We want to add Solid pods as a fourth backend to this library. This will involve some work on the login widget,
triggering the authentication flow, and accessing the pod for create/read/update/delete of files.

### F3. LDO improvements 6k
To be specified

### E1. solidcommunity.net NSS->CSS migration and server admin 1k
To help app developers make use of our modules, it is useful if our test server, solidcommunity.net, is updated to the latest code and we make sure
the server is running reliably again, without memory leaks and restarts.

### E2. Solid Chat - Slack Bridge 2k
A bridge that adds Slack's API as a data format in the chat data module, and can move data between a Slack chat channel and a Solid chat channel,
and vice versa. This is an extension to the chat data module that shows how it can be used in practice to achieve real-time liquid data between
different schemas for the same type of data.

### E3. Solid Data Modules for Android (first part) 1k
To be specified

### E4. Solid Data Modules for Android (second part) 1k
To be specified

### E5. Solid Data Modules for Android (last part) 1k

### E6. Outreach (first part) 2k
### E7. Outreach (second part) 2k
### E8. Outreach (last part) 2k
