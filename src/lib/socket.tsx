import { io, Socket } from "socket.io-client";

const PRIMARY_URL = process.env.NEXT_PUBLIC_API_URL!;
// const FALLBACK_URL = "http://localhost:4001";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(PRIMARY_URL, {
      autoConnect: false, // we will connect manually in component
      withCredentials: true,
    });

    // Only attach this listener once
    socket.once("connect_error", () => {

      socket?.disconnect();

      // socket = io(FALLBACK_URL, {
      //   autoConnect: true,
      //   withCredentials: true,
      // });
    });
  }

  return socket;
};
