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
  const [incomingCall, setIncomingCall] = useState<any>(null); // <-- persistent incoming call

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect(); // connect once
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.id);

        socket.on("connect", () => {
          socket.emit("register", data.id);
        });

        if (socket.connected) {
          socket.emit("register", data.id);
        }
      });

    // Listen for incoming calls at parent level
    const handleIncomingCall = (data: any) => {
      setIncomingCall(data);
    };

    socket.on("incomingCall", handleIncomingCall);

    return () => {
      socket.off("connect");
      socket.off("incomingCall", handleIncomingCall);
    };
  }, []);

  return (
    <div className="chat-container">
      <FriendsList
        onSelect={setActiveFriend}
        incomingCall={incomingCall} // pass down for ringing indicator
      />

      {activeFriend && (
        <ChatWindow
          friend={activeFriend}
          userId={userId}
          incomingCall={incomingCall} // pass down
          setIncomingCall={setIncomingCall} // allow clearing
        />
      )}
    </div>
  );
}
