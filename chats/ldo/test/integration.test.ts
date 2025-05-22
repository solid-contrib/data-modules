import { describe, it, expect } from "vitest";
import { setupServer } from "@ldo/test-solid-server";
import { testFiles } from "./testFiles.helper";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("integration", () => {
  const s = setupServer(
    3003,
    testFiles,
    path.join(
      __dirname,
      "./configs/components-config/unauthenticatedServer.json",
    ),
    true
  );

  it("trivial", () => {
    expect(true).toBe(true);
  });
});
