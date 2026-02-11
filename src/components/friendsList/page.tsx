/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/src/lib/socket";

export default function FriendsList({ onSelect }: any) {
  const [friends, setFriends] = useState<any[]>([]);
  const [ringingUser, setRingingUser] = useState<string | null>(null);

  // Fetch friends
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/friends`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setFriends(data));
  }, []);

  // Listen for incoming call
  useEffect(() => {
    const socket = getSocket();

    const handleIncomingCall = (data: any) => {
      setRingingUser(data.from);
    };

    socket.on("incomingCall", handleIncomingCall);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
    };
  }, []);

  return (
    <div className="friends-list">
      <h3>Friends</h3>
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="friend-item"
          onClick={() => {
            setRingingUser(null); // stop ringing when opened
            onSelect(friend);
          }}
        >
          {friend.username}
          {ringingUser === friend.id && (
            <span> 🔔 Ringing </span>
          )}
        </div>
      ))}
    </div>
  );
}
