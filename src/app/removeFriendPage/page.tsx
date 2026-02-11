/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./removeFriend.css";

export default function RemoveFriendPage() {
  const [friends, setFriends] = useState<any[]>([]);

  const fetchFriends = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/accepted`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const removeFriend = (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/remove/${friendId}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        // remove from state
        setFriends(friends.filter(f => f.sender.id !== friendId && f.receiver.id !== friendId));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="remove-friend-container">
      <h2>Friends List</h2>
      {friends.length === 0 && <p>No friends found</p>}
      <ul className="friends-list">
        {friends.map((f) => {
          const friend = f.sender.id === f.userId ? f.receiver : f.sender;
          return (
            <li key={friend.id} className="friend-item">
              <span>{friend.username}</span>
              <button onClick={() => removeFriend(friend.id)}>Remove</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
