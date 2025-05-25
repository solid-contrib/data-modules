# Chats - Data Module (LDO)

A chat module for solid written with LDO.

Okay, I can help you update the README.md file with installation and usage documentation.

Here's an updated version of your README.md:
Markdown

# Chats - Data Module (LDO)

A chat module for Solid written with LDO.

## Installation

To install this library, use npm:

```bash
npm install @solid-data-modules/chats-ldo @ldo/connected-solid @ldo/connected @ldo/ldo
```

## Usage

Here's how you can use the @solid-data-modules/chats-ldo library to manage chats in a Solid Pod.
Importing

First, import the necessary components from the library:
```TypeScript

import { Chat, ChatShape } from "@solid-data-modules/chats-ldo";
import { createSolidLdoDataset, SolidConnectedPlugin } from "@ldo/connected-solid";
import { ConnectedLdoDataset } from "@ldo/connected";
```

### Initialization

You'll need to create a SolidLdoDataset instance. This dataset will be used to interact with Solid Pods.

```TypeScript
const dataset: ConnectedLdoDataset<SolidConnectedPlugin[]> = createSolidLdoDataset();
```

### Creating a Chat Instance

To work with a chat, create an instance of the Chat class by providing the container URI where the chat data is or will be stored, and the dataset instance.

```TypeScript
const chatContainerUri = "http://localhost:3003/your-chat-container/"; // Replace with your chat container URI
const chat = new Chat(chatContainerUri, dataset);
```

### Creating a New Chat on a Pod

If the chat doesn't exist yet, you can create it.

```TypeScript
const webId = "http://example.com/profile/card#me"; // Replace with the author's WebID

async function initializeChat() {
  try {
    const newChatInfo: ChatShape = {
      "@id": `${chatContainerUri}index.ttl#this`, // Optional: specify the ID of the chat resource
      type: { "@id": "LongChat" }, // Specifies the type of chat
      author: { "@id": webId },
      created: new Date().toISOString(),
      title: "My Awesome Chat",
    };
    await chat.createChat(newChatInfo);
    console.log("Chat created successfully!");
  } catch (error) {
    console.error("Error creating chat:", error);
  }
}

initializeChat();
```

For the ChatShape properties like type and author, you typically provide an object with an @id property pointing to the respective RDF term or WebID.

### Getting Chat Information

You can retrieve the information of an existing chat.

```TypeScript
async function logChatInfo() {
  try {
    const chatInfo = await chat.getChatInfo();
    console.log("Chat Title:", chatInfo.title);
    console.log("Chat Author:", chatInfo.author?.["@id"]);
    console.log("Chat Created:", chatInfo.created);
  } catch (error) {
    console.error("Error getting chat info:", error);
  }
}

logChatInfo();
```

### Updating Chat Information

You can update the properties of a chat.

```TypeScript
async function updateChatTitle() {
  try {
    await chat.setChatInfo({
      title: "My Updated Awesome Chat",
    });
    console.log("Chat title updated!");
    const updatedInfo = await chat.getChatInfo();
    console.log("New Chat Title:", updatedInfo.title);
  } catch (error) {
    console.error("Error updating chat info:", error);
  }
}

updateChatTitle();
```

### Sending a Message

Send a new message to the chat.

```TypeScript
async function postMessage() {
  try {
    const senderWebId = "[http://example.com/another-profile/card#me](http://example.com/another-profile/card#me)"; // Replace with sender's WebID
    await chat.sendMessage("Hello Solid World!", senderWebId);
    console.log("Message sent!");
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

postMessage();
```

### Iterating Through Messages

You can iterate through the messages in a chat. The iterator returns messages in groups, typically by the day they were posted, from most recent to oldest.

```TypeScript
async function readMessages() {
  try {
    const messageIterator = chat.getMessageIterator();
    console.log("Chat Messages (most recent first):");
    for await (const messageGroup of messageIterator) {
      // Messages in messageGroup are sorted from most recent to least recent for that specific day/resource
      messageGroup.forEach(message => {
        console.log(`- [${message.created2}] ${message.maker?.["@id"]}: ${message.content}`);
      });
    }
  } catch (error) {
    console.error("Error reading messages:", error);
  }
}

readMessages();
```

### Subscribing to New Messages

You can subscribe to receive real-time updates for new messages.

```TypeScript
async function subscribeToChatMessages() {
  try {
    console.log("Subscribing to new messages...");
    await chat.subscribeToMessages((newMessages) => {
      console.log("New message(s) received:", newMessages.length);
      newMessages.forEach(message => {
        console.log(`> [${message.created2}] ${message.maker?.["@id"]}: ${message.content}`);
      });
    });
    console.log("Now listening for incoming messages.");
    // Keep the process alive to receive messages, or integrate into your app's lifecycle.
  } catch (error) {
    console.error("Error subscribing to messages:", error);
  }
}

subscribeToChatMessages();

// To stop listening:
// await chat.unsubscribeFromMessages();
// console.log("Unsubscribed from messages.");
```

The subscribeToMessages method sets up a WebSocket connection to the message resource of the current day and listens for updates. It automatically handles transitioning to a new day's message resource.

### Removing a Message

You can remove a specific message by its ID.

```TypeScript
async function deleteMessage(messageId: string) {
  try {
    await chat.removeMessage(messageId);
    console.log(`Message ${messageId} removed.`);
  } catch (error) {
    console.error("Error removing message:", error);
  }
}

// Example: deleteMessage("http://localhost:3003/your-chat-container/2024/05/25/index.ttl#some-message-uuid");
```

### Deleting a Chat

You can delete the entire chat container and its contents.

```TypeScript
async function removeChat() {
  try {
    await chat.deleteChat();
    console.log("Chat deleted successfully.");
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
}

// removeChat();
```

### Cleaning Up

When you are done with a Chat instance, especially if you've used subscriptions, call the destroy method to clean up any listeners or timers.

```TypeScript
async function cleanupChat() {
  await chat.destroy();
  console.log("Chat instance cleaned up.");
}

// Call this when the chat instance is no longer needed, e.g., when a component unmounts.
// cleanupChat();
```


## Funding

This project is funded through [NGI0 Entrust](https://nlnet.nl/entrust), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/SolidDataModules).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/entrust)
