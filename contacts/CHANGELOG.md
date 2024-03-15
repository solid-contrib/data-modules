# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- [addNewPhoneNumber](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#addNewPhoneNumber)

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