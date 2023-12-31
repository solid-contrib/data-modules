# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.2.1

### Fixed

- ContactsModuleRdfLib is now exported from package root

## 0.2.0

### Added

- [readContact](https://solid-contrib.github.io/data-modules/contacts-rdflib-api/interfaces/ContactsModule.html#readContact)

### Breaking Changes

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