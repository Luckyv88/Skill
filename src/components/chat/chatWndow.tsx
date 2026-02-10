/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import "./chatWindow.css";

export default function ChatWindow({ friend, userId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  //  Fetch chat history when friend changes
  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/history/${friend.id}`,
      { credentials: "include" }
    )
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [friend]);

  //  Listen for live messages
  useEffect(() => {
    const socket = getSocket();

    const handleMessage = (data: any) => {
      // Only add message if it belongs to this chat
      if (
        data.sender.id === friend.id ||
        data.receiver.id === friend.id
      ) {
        setMessages(prev => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [friend]);

  //  Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    const socket = getSocket();

    socket.emit("sendMessage", {
      receiverId: friend.id,
      message,
    });

    setMessage("");
  };

  // Call user
  const callUser = (type: "video" | "audio") => {
    const socket = getSocket();

    socket.emit("callUser", {
      to: friend.id,
      signal: { type },
    });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{friend.username}</h3>
        <div>
          <button onClick={() => callUser("audio")}>Audio</button>
          <button onClick={() => callUser("video")}>Video</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender.id === userId
                ? "my-message"
                : "friend-message"
            }
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
