import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ length: 10 });

/**
 * Generates a short ID that can be used for URI fragments, document or container names.
 */
export function generateId() {
  return uid.rnd(6);
}
