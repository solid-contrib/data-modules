# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- [renameContact](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#renameContact)
- [updatePhoneNumber](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#updatePhoneNumber)

### Changed

- [createAddressBook](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#createAddressBook)
  - allows to optionally pass a `ownerWebId` to add the new address book to the private type index of that user.


## 0.5.0

### Added

- [addNewPhoneNumber](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#addNewPhoneNumber)
- [addNewEmailAddress](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#addNewEmailAddress)
- [removePhoneNumber](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#removePhoneNumber)
- [removeEmailAddress](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#removeEmailAddress)
- [listAddressBooks](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#listAddressBooks)

### Changed

- Newly created address books, contacts & groups now use a 6 character [short unique ID](https://www.npmjs.com/package/short-unique-id) instead of a uuid v4. Those identifiers do not have to be globally unique, only in the scope of the target container / address book / group. The short ID has enough entropy to prevent collisions in these contexts, but leads to much shorter URIs.

## 0.4.0

### Added

- [removeContactFromGroup](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#removeContactFromGroup)

### Changed

- [createNewContact](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#createNewContact) now allows to pass `groupUris` to add the new contact to existing groups initially

### ⚠ Breaking Changes 

- Migrated to ESM format, CommonJS is no longer provided
- ContactsModuleRdfLib is now the default export

## 0.3.0

### Added

- [createNewGroup](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#createNewGroup)
- [readGroup](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#readGroup)
- [addContactToGroup](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#addContactToGroup)

## 0.2.1

### Fixed

- ContactsModuleRdfLib is now exported from package root

## 0.2.0

### Added

- [readContact](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#readContact)

### ⚠ Breaking Changes

- [CreateAddressBookCommand](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/CreateAddressBookCommand.html)
  - property `container` renamed to `containerUri`
- [CreateNewContactCommand](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/CreateNewContactCommand.html)
  - property `addressBook` renamed to `addressBookUri`
- rdflib now needs to be installed as peer dependency

## 0.1.0

### Added

- [readAddressBook](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#readAddressBook)
- [createAddressBook](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#createAddressBook)
- [createNewContact](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#createNewContact)