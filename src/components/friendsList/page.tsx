/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function FriendsList({ onSelect }: any) {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/friends`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setFriends(data));
  }, []);

  return (
    <div className="friends-list">
      <h3>Friends</h3>
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="friend-item"
          onClick={() => onSelect(friend)}
        >
          {friend.username}
        </div>
      ))}
    </div>
  );
}
