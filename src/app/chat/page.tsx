/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import FriendsList from "@/src/components/friendsList/page";
import ChatWindow from "@/src/components/chat/chatWndow";
import "./chat.css";

export default function ChatPage() {
  const [activeFriend, setActiveFriend] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const socket = getSocket();

    socket.connect();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setUserId(data.id);

        // register AFTER connection
        socket.emit("register", data.id);
      });

    return () => {
      socket.off();
    };
  }, []);

  return (
    <div className="chat-container">
      <FriendsList onSelect={setActiveFriend} />

      {activeFriend && (
        <ChatWindow
          friend={activeFriend}
          userId={userId}
        />
      )}
    </div>
  );
}
