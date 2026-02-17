/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";
import { useRouter } from "next/navigation";
import "./chatWindow.css";

export default function ChatWindow({
  friend,
  userId,
  incomingCall,
  setIncomingCall,
  onlineStatus,
}: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // ------------------- Fetch chat history -------------------
  useEffect(() => {
    if (!friend?.id) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/history/${friend.id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [friend]);

  // ------------------- Listen for messages & call events -------------------
  useEffect(() => {
    if (!friend?.id) return;

    const socket = getSocket();

    const handleMessage = (data: any) => {
      if (data.sender.id === friend.id || data.receiver.id === friend.id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleCallRejected = () => alert("Call Rejected");
    const handleUserBusy = () => alert("User is Busy");
    const handleCallEnded = () => setIncomingCall(null);
    const handleCallAccepted = (data: any) => {
      // Navigate to call page as caller
      router.push(
        `/call?type=${data.signalData?.callType || "video"}&friendId=${friend.id}&userId=${userId}&mode=caller`
      );
      setIncomingCall(null);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("callRejected", handleCallRejected);
    socket.on("userBusy", handleUserBusy);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("callRejected", handleCallRejected);
      socket.off("userBusy", handleUserBusy);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callEnded", handleCallEnded);
    };
  }, [friend]);

  // ------------------- Send Message -------------------
  const sendMessage = () => {
    if (!message.trim()) return;
    const socket = getSocket();

    socket.emit("sendMessage", {
      receiverId: friend.id,
      message,
    });

    setMessage("");
  };

  // ------------------- Call User -------------------
  const callUser = (type: "video" | "audio") => {
    if (!friend?.id || !userId) return;
    const socket = getSocket();

    socket.emit("callUser", {
      to: friend.id,
      from: userId,
      signalData: { callType: type }, // match ChatGateway
      callType: type,
    });
  };

  // ------------------- Accept Call -------------------
  const acceptCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();

    socket.emit("acceptCall", {
      to: incomingCall.from,
      signalData: incomingCall.signalData,
    });

    setIncomingCall(null);

    router.push(
      `/call?type=${incomingCall.signalData.callType}&friendId=${incomingCall.from}&userId=${userId}&mode=receiver`
    );
  };

  // ------------------- Reject Call -------------------
  const rejectCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();

    socket.emit("rejectCall", {
      to: incomingCall.from,
    });

    setIncomingCall(null);
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
        {Array.isArray(messages) &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.sender.id === userId ? "my-message" : "friend-message"}
            >
              {msg.message}
            </div>
          ))}
      </div>

      {incomingCall && incomingCall.from === friend.id && (
        <div className="call-popup">
          <p>Incoming {incomingCall.signalData.callType} Call</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}  