import { describe, it, expect } from "vitest";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

describe("API contract tests", () => {
  it("check-auth response structure", async () => {
    const res = await axios.get(`${API_URL}/check-auth`);

    expect(res.status).toBe(200);

    // контракт
    expect(res.data).toMatchObject({
      isAuthenticated: expect.any(Boolean),
    });

    // если вдруг авторизован (на будущее)
    if (res.data.isAuthenticated) {
      expect(res.data).toHaveProperty("user");
      expect(res.data).toHaveProperty("id");
      expect(res.data).toHaveProperty("cookieExpires");
    }
  });

  it("session error structure", async () => {
    try {
      await axios.get(`${API_URL}/session`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data).toMatchObject({
          message: expect.any(String),
        });
      }
    }
  });
});