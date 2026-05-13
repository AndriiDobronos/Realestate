import { describe, it, expect } from "vitest";

import { safeRequest } from "./test-utils/safeRequest";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

describe("Auth smoke tests", () => {
  it("should return isAuthenticated: false when no session", async () => {
    const res = await safeRequest(`${API_URL}/check-auth`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("isAuthenticated");
    expect(typeof res.data.isAuthenticated).toBe("boolean");

    // ключевая проверка
    expect(res.data.isAuthenticated).toBe(false);
  });
});