import { describe, it, expect, vi } from "vitest";

// Use vi.hoisted to safely create mocks referenced by a hoisted vi.mock factory.
const hoisted = vi.hoisted(() => {
  const cloneMock = vi.fn(async () => {});
  const degitMock = vi.fn(() => ({ clone: cloneMock }));
  return { cloneMock, degitMock };
});

vi.mock("degit", () => ({
  default: hoisted.degitMock,
}));

import { downloadTemplate } from "../src/core/template.js";

describe("downloadTemplate", () => {
  it("calls degit with repo and clones to outDir", async () => {
    await downloadTemplate("owner/repo", "/tmp/out");
    expect(hoisted.degitMock).toHaveBeenCalledWith("owner/repo", expect.any(Object));
    expect(hoisted.cloneMock).toHaveBeenCalledWith("/tmp/out");
  });

  it("appends ref when provided", async () => {
    await downloadTemplate("owner/repo", "/tmp/out2", "main");
    expect(hoisted.degitMock).toHaveBeenCalledWith("owner/repo#main", expect.any(Object));
  });
});
