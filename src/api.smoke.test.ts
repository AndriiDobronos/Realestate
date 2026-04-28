import { describe, it, expect } from "vitest";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

describe("API smoke test", () => {
  it("should return data from backend", async () => {
    const res = await axios.get(`${API_URL}/api/test`);
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });
});