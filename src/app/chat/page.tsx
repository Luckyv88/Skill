"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import "./chat.css";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.connect();
  }, []);

  const sendMessage = () => {
    socket.emit("sendMessage", {
      senderId: "yourUserId",
      receiverId: "friendId",
      message,
    });
    setMessage("");
  };

  return (
    <div className="page-container">
      <h2>Chat</h2>

      <div className="chat-box"></div>

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
