import { IndexedFormula, NamedNode } from "rdflib";
import { ContainerQuery, ldp, rdf } from "@solid-data-modules/rdflib-utils";

export class DateContainerQuery {
  constructor(
    private container: NamedNode,
    private store: IndexedFormula,
  ) {}

  queryLatest(): NamedNode | null {
    const contents = new ContainerQuery(
      this.container,
      this.store,
    ).queryContents();
    const childContainers = contents.filter((it) => {
      return this.store.holds(
        it,
        rdf("type"),
        ldp("Container"),
        this.container.doc(),
      );
    });
    return childContainers[0] ?? null; // TODO actually get latest
  }
}
