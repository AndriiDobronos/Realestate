// src/session.smoke.test.ts

import { describe, it, expect } from "vitest";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


describe("Session smoke tests", () => {
  it("should return 401 when no active session", async () => {
    try {
      await axios.get(`${API_URL}/session`, {
        withCredentials: true,
      });

      // если вдруг не упал — это ошибка
      throw new Error("Expected 401 but got success");
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty("message");
    }
  });
});