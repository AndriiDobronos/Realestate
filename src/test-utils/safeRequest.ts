import axios, { AxiosResponse } from "axios";

export async function safeRequest(
  url: string,
  retries = 3,
  delay = 2000
): Promise<AxiosResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { withCredentials: true });
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable code");
}