# data-modules
Solid Data Modules

[Matrix](https://app.gitter.im/index.html#/room/#solid-data-modules:gitter.im)

[conventions](https://pdsinterop.org/conventions/overview/)

[plan](https://hackmd.io/@michielbdejong/HyIMjmoxn)

Weekly meeting: Fridays 4pm-5pm Amsterdam time in https://meet.jit.si/solid-data-modules


## How this monorepo works
While you can work independently on package itself, lerna (like npm workspaces) can help with dependencies, and code sharing

- lerna run command will execute all npm scripts with the given identifier:
e.g. npx lerna run build will trigger all npm run builds inside all workspace folders
- also, it will take into account packages that are referenced in other packages
e.g. soukai-solid-utils is referenced in bookmarks and visited-places so that it will build soukai-solid-utils first and then both bookmarks and visited-places in parallel
- nx will cache build artifacts to reduce the next build times