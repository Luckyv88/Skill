/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";  
import "./removeFriend.css";

export default function RemoveFriendPage() {
    const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Fetch logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const user = await res.json();
        setCurrentUserId(user.id);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // 🔹 Fetch accepted friends
  const fetchFriends = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/accepted`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch friends");
        }

        return data;
      })
      .then((data) => {

        if (Array.isArray(data)) {
          setFriends(data);
        } else if (Array.isArray(data.data)) {
          setFriends(data.data);
        } else {
          setFriends([]);
        }
      })
      .catch((err) => {
        console.error("Fetch friends error:", err);
        setFriends([]);
      });
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // 🔹 Remove friend
  const removeFriend = (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/remove/${friendId}`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to remove friend");
        }

        return data;
      })
      .then(() => {
        // safer state update
        setFriends((prev) =>
          prev.filter(
            (f) =>
              f.sender.id !== friendId &&
              f.receiver.id !== friendId
          )
        );
      })
      .catch((err) => console.error("Remove error:", err));
  };

  return (
    <div className="remove-friend-container">
        <button
    type="button"
    onClick={() => router.back()}
    style={{
      marginBottom: "15px",
      padding: "6px 12px",
      cursor: "pointer",
    }}
  >
    ← Back
  </button>
      <h2>Friends List</h2>

      {friends.length === 0 && <p>No friends found</p>}

      <ul className="friends-list">
        {Array.isArray(friends) &&
          friends.map((f) => {
            //Correct friend logic
            const friend =
              f.sender.id === currentUserId
                ? f.receiver
                : f.sender;

            return (
              <li key={friend.id} className="friend-item">
                <span>{friend.username}</span>
                <button
                  onClick={() => removeFriend(friend.id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
