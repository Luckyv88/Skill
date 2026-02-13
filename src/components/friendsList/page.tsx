/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/src/lib/socket";

export default function FriendsList({ onSelect }: any) {
  const [friends, setFriends] = useState<any[]>([]);
  const [ringingUser, setRingingUser] = useState<string | null>(null);
  const router = useRouter();
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
      <button
  type="button"
  onClick={() => router.back()}
  style={{
    marginBottom: "10px",
    padding: "6px 12px",
    cursor: "pointer",
  }}
>
  ← Back
</button>

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
