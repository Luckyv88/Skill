/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import FriendsList from "@/src/components/friendsList/page";
import ChatWindow from "@/src/components/chat/chatWindow";
import "./chat.css";

export default function ChatPage() {
  const [activeFriend, setActiveFriend] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [onlineStatus, setOnlineStatus] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) socket.connect();

    // Fetch current user ID
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.id);
        socket.emit("join", data.id);
      });

    // ------------------- Socket Listeners -------------------
    const handleIncomingCall = (data: any) => {
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
    };

    const handleUpdateStatus = (data: { userId: string; status: string }) => {
      setOnlineStatus((prev) => {
        const map = new Map(prev);
        map.set(data.userId, data.status);
        return map;
      });
    };

    const handleCallAccepted = (data: any) => {
      // Clear incomingCall if call is accepted
      setIncomingCall(null);
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callEnded", handleCallEnded);
    socket.on("updateStatus", handleUpdateStatus);
    socket.on("callAccepted", handleCallAccepted);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callEnded", handleCallEnded);
      socket.off("updateStatus", handleUpdateStatus);
      socket.off("callAccepted", handleCallAccepted);
    };
  }, []);

  return (
    <div className="chat-container">
      <FriendsList
        onSelect={setActiveFriend}
        incomingCall={incomingCall}
        onlineStatus={onlineStatus}
      />

      {activeFriend && (
        <ChatWindow
          friend={activeFriend}
          userId={userId}
          incomingCall={incomingCall}
          setIncomingCall={setIncomingCall} // ChatWindow can now clear incomingCall
          onlineStatus={onlineStatus}
        />
      )}
    </div>
  );
}
