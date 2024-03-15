import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

export function generateId() {
  return uid.rnd(6);
}
