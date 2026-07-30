import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/server/api/schemas/user.schema";

describe("updateProfileSchema", () => {
  it("accepts valid names", () => {
    const parsed = updateProfileSchema.parse({ name: "Magnus" });
    expect(parsed.name).toBe("Magnus");
  });

  it("rejects empty names", () => {
    expect(() => updateProfileSchema.parse({ name: "" })).toThrow();
  });
});
