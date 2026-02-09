/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/./src/lib/socket";
import "./ChatWindow.css";

interface Props {
  userId: string;
  friendId: string;
}

export default function ChatWindow({ userId, friendId }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    socket.emit("register", userId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (from) => {
      if (from === friendId) setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    socket.on("userOnline", (id) => {
      console.log(id, "is online");
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("userOnline");
    };
  }, [friendId, userId]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: friendId,
      message: text,
    });

    setMessages((prev) => [
      ...prev,
      { sender: { id: userId }, message: text },
    ]);

    setText("");
  };

  const handleTyping = () => {
    socket.emit("typing", {
      to: friendId,
      from: userId,
    });
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.sender.id === userId ? "my-message" : "friend-message"
            }
          >
            {m.message}
          </div>
        ))}
        {typing && <div className="typing">Typing...</div>}
      </div>

      <div className="input-area">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
