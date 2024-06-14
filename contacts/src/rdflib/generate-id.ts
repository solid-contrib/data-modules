import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

// TODO replace with utils lib
export function generateId() {
  return uid.rnd(6);
}
