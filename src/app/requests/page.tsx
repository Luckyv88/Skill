/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./requests.css";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        console.log("All Requests:", data);
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to load requests");
        setRequests([]);
      });
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/accept/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Accept response:", data);

      setRequests(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "ACCEPTED" } : r
        )
      );
    } catch (err: any) {
      console.error("Accept error:", err);
      alert("Failed to accept request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/reject/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Reject response:", data);

      setRequests(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "REJECTED" } : r
        )
      );
    } catch (err: any) {
      console.error("Reject error:", err);
      alert("Failed to reject request");
    }
  };

  return (
    <div className="page-container">
      <h2>Your Requests</h2>

      {error && <p className="error">{error}</p>}

      {!error && requests.length === 0 && (
        <p>No requests found.</p>
      )}

      {requests.map((req, i) => (
        <div key={i} className="request-card">
          <p>
            From: <strong>{req.sender?.username}</strong>
          </p>

          <p>Status: {req.status}</p>

          {req.status === "PENDING" && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleAccept(req.id)}
                style={{
                  marginRight: "10px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Accept
              </button>

              <button
                onClick={() => handleReject(req.id)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
