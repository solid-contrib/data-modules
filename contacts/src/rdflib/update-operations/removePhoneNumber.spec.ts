import { removePhoneNumber } from "./removePhoneNumber.js";
import { graph, st, sym } from "rdflib";
import { vcard } from "../namespaces.js";

describe("removePhoneNumber", () => {
  it("deletes any statement from the phone doc where the phone number is the subject", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const phoneNode = sym("https://pod.test/contacts/1/phone#this");

    store.add(
      st(phoneNode, vcard("anything"), sym("tel:1234"), phoneNode.doc()),
    );

    const result = removePhoneNumber(contactNode, phoneNode, store);
    expect(result.deletions).toContainEqual(
      st(
        sym("https://pod.test/contacts/1/phone#this"),
        vcard("anything"),
        sym("tel:1234"),
        phoneNode.doc(),
      ),
    );
  });

  it("does not delete statements about the phone number in other known documeunts", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const phoneNode = sym("https://pod.test/contacts/1/phone#this");

    store.add(
      st(
        phoneNode,
        vcard("anything"),
        sym("tel:1234"),
        sym("https://elsewhere.test"),
      ),
    );

    const result = removePhoneNumber(contactNode, phoneNode, store);
    expect(result.deletions).not.toContainEqual(
      st(
        phoneNode,
        vcard("anything"),
        sym("tel:1234"),
        sym("https://elsewhere.test"),
      ),
    );
  });

  it("removes the link from contact to phone", () => {
    const store = graph();

    const contactNode = sym("https://pod.test/contacts/1#this");
    const phoneNode = sym("https://pod.test/contacts/1/phone#this");

    store.add(
      st(contactNode, vcard("hasTelephone"), phoneNode, contactNode.doc()),
    );

    const result = removePhoneNumber(contactNode, phoneNode, store);
    expect(result.deletions).toContainEqual(
      st(contactNode, vcard("hasTelephone"), phoneNode, contactNode.doc()),
    );
  });
});
