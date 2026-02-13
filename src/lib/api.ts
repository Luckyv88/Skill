/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URLS = [
  process.env.NEXT_PUBLIC_API_URL,
  // "http://localhost:4001",
].filter(Boolean); // remove undefined values

export default async function apiRequest(
  url: string,
  method: string,
  body?: any
) {
  let lastError: any;

  for (const baseUrl of API_URLS) {
    try {
      const res = await fetch(`${baseUrl}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API request failed");
      }

      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
