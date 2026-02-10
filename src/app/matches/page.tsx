/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./matches.css";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/matches`, {
      credentials: "include", // include cookies for JWT
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then(data => {
        console.log("API Response:", data); // check what backend returns
        setMatches(data || []); // assign array safely
      })
      .catch(err => setError(err.message));
  }, []);

  // Added send request function
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

      alert("Request sent successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Your Matches</h2>

      {error && <p className="error">{error}</p>}

      {!error && matches.length === 0 && <p>No matches found.</p>}

      {matches.map((m, i) => (
        <div key={i} className="match-card">
          {m.name} - {m.user?.username}

          {/* Added Request Button */}
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
        </div>
      ))}
    </div>
  );
}
