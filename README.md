# data-modules
Solid Data Modules are snippets of JavaScript code that handle the reading and writing of one specific
type of data in the user's Solid pod, regardless of how the different data formats used by various Solid apps,
and how they evolve.

[Join our chat room on Matrix](https://app.gitter.im/index.html#/room/#solid-data-modules:gitter.im)

[Read the data conventions we have documented so far](https://pdsinterop.org/conventions/overview/)

[Our plan](https://hackmd.io/@michielbdejong/HyIMjmoxn)

Weekly meeting: Fridays 4pm-5pm Amsterdam time in https://meet.jit.si/solid-data-modules

## Data types covered
### _(coming soon)_
Data types for which we will produce Solid Data Modules:
* bookmarks
* chat
* contacts
* maps
* tasks

## Paradigms covered
### _(coming soon)_
The "vanilla" version of each of these data modules will be usable in combination with just an
authenticated fetcher, such as [Solid Auth Fetcher](https://github.com/solid-contrib/solid-auth-fetcher),
or the fetcher from the [Inrupt JS Libs](https://docs.inrupt.com/developer-tools/javascript/client-libraries/authentication/).
Apart from this "vanilla" version, we will also package each data module for use in combination with the following client-side Solid app paradigms:
* [Soukai-Solid](https://github.com/NoelDeMartin/soukai-solid)
* [rdflib](https://github.com/linkeddata/rdflib.js)
* [LDO](https://github.com/o-development/ldo)

Create a new module [Link to tutorial](./new-module.md)