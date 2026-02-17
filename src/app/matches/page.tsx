/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./matches.css";

export default function MatchesPage() {
    const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [sentRequests, setSentRequests] = useState<string[]>([]); // added

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/matches`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then(data => {
        setMatches(data || []);
      })
      .catch(err => setError(err.message));
  }, []);

  //  Updated send request function
  const sendRequest = async (receiverId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/send/${receiverId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to send request");

      // Instantly hide button
      setSentRequests(prev => [...prev, receiverId]);

      alert("Request sent successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
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
      <h2>Your Matches</h2>

      {error && <p className="error">{error}</p>}

      {!error && matches.length === 0 && <p>No matches found.</p>}

      {matches.map((m, i) => (
        <div key={i} className="match-card">
          {m.name} - {m.user?.username}

          {/* Button will disappear if request sent */}
          {!sentRequests.includes(m.user?.id) && (
            <button
              onClick={() => sendRequest(m.user?.id)}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Send Request
            </button>
          )}

          {/* Optional status text */}
          {sentRequests.includes(m.user?.id) && (
            <span style={{ marginLeft: "10px", color: "orange" }}>
              Request Sent
            </span>
          )}
        </div>
      ))}
    </div>
  );
}