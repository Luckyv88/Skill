/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import multiavatar from '@multiavatar/multiavatar/esm';

export function generateAvatar(username: string): string {
  const svg = multiavatar(username);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
