import { graph, st, sym } from "rdflib";
import { vcard } from "../namespaces";
import { removeEmailAddress } from "./removeEmailAddress";

describe("removeEmailAddress", () => {
  it("deletes any statement from the email address doc where the email address is the subject", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const emailNode = sym("https://pod.test/contacts/1/email#this");

    store.add(
      st(
        emailNode,
        vcard("anything"),
        sym("mailto:alice@mail.test"),
        emailNode.doc(),
      ),
    );

    const result = removeEmailAddress(contactNode, emailNode, store);
    expect(result.deletions).toContainEqual(
      st(
        sym("https://pod.test/contacts/1/email#this"),
        vcard("anything"),
        sym("mailto:alice@mail.test"),
        emailNode.doc(),
      ),
    );
  });

  it("does not delete statements about the email address in other known documents", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const emailNode = sym("https://pod.test/contacts/1/email#this");

    store.add(
      st(
        emailNode,
        vcard("anything"),
        sym("mailto:alice@mail.test"),
        sym("https://elsewhere.test"),
      ),
    );

    const result = removeEmailAddress(contactNode, emailNode, store);
    expect(result.deletions).not.toContainEqual(
      st(
        emailNode,
        vcard("anything"),
        sym("mailto:alice@mail.test"),
        sym("https://elsewhere.test"),
      ),
    );
  });

  it("removes the link from contact to email", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const emailNode = sym("https://pod.test/contacts/1/email#this");

    store.add(st(contactNode, vcard("hasEmail"), emailNode, contactNode.doc()));

    const result = removeEmailAddress(contactNode, emailNode, store);
    expect(result.deletions).toContainEqual(
      st(contactNode, vcard("hasEmail"), emailNode, contactNode.doc()),
    );
  });
});
