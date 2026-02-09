"use client";

import { useEffect } from "react";
import  { getSocket  }  from "@/./src/lib/socket";

export const useSocket = (userId: string) => {
  useEffect(() => {
    const socket = getSocket();

    socket.emit("register", userId);

    return () => {
      socket.off();
    };
  }, [userId]);
};
