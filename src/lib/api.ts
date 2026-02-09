/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function apiRequest(url: string, method: string, body?: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'API request failed');
  }

  return res.json();
}
