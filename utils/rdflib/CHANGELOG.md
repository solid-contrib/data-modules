# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changes

- [mockLdpContainer](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockLdpContainer.html)
  now allows to add additional turtle to include into the mock response

## 0.4.0

### Added

- [ContainerQuery](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.ContainerQuery.html)
  to query for container contents

### Changed

- [mockLdpContainer](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockLdpContainer.html)
  now allows to fake container contents

## 0.3.0

### Added

- [discoverType](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.ModuleSupport.html#discoverType)

## 0.2.0

### Added

- [ModuleSupport](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.ModuleSupport.html)
- [TypeIndexQuery](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.TypeIndexQuery.html)
- [addInstanceToTypeIndex](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.addInstanceToTypeIndex.html)
- helper functions to generate terms in common Solid namespaces:
  - [ldp](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.ldp.html)
  - [pim](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.pim.html)
  - [rdf](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.rdf.html)
  - [solid](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.solid.html)

### Breaking Change

- [generateId](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/identifier.generateId.html):
  Moved to submodule

## 0.1.1

### Added

- [ProfileQuery](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.ProfileQuery.html)
- [PreferencesQuery](https://solid-contrib.github.io/data-modules/rdflib-utils/classes/index.ProfileQuery.html)

## 0.1.0

### Added

- [executeUpdate](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.executeUpdate.html)
- [fetchNode](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.fetchNode.html)
- [generateId](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/index.generateId.html)
- [test-support](https://solid-contrib.github.io/data-modules/rdflib-utils/modules/test_support.html):
  - [expectPatchRequest](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.expectPatchRequest.html)
  - [expectPutEmptyTurtleFile](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.expectPutEmptyTurtleFile.html)
  - [mockForbidden](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockForbidden.html)
  - [mockLdpContainer](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockLdpContainer.html)
  - [mockNotFound](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockNotFound.html)
  - [mockTurtleDocument](https://solid-contrib.github.io/data-modules/rdflib-utils/functions/test_support.mockTurtleDocument.html)
