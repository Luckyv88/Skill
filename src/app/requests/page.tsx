/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./requests.css";

export default function RequestsPage() {
    const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  //  Get logged-in user properly
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            credentials: "include",
          }
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

  //  Fetch all requests
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch requests");
        }
        return data;
      })
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load requests");
        setRequests([]);
      });
  }, []);

  const handleAccept = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/accept/${id}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to accept request");
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "ACCEPTED" } : r
      )
    );
  };

  const handleReject = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests/reject/${id}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to reject request");
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "REJECTED" } : r
      )
    );
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
      <h2>Your Requests</h2>

      {error && <p className="error">{error}</p>}

      {!error && requests.length === 0 && (
        <p>No requests found.</p>
      )}

      {requests.map((req) => {
        const isReceiver = req.receiver?.id === currentUserId;
        const isSender = req.sender?.id === currentUserId;

        return (
          <div key={req.id} className="request-card">
            {/*  Show correct name */}
            {isReceiver && (
              <p>
                From: <strong>{req.sender?.username}</strong>
              </p>
            )}

            {isSender && (
              <p>
                To: <strong>{req.receiver?.username}</strong>
              </p>
            )}

            <p>Status: {req.status}</p>

            {/*  Only receiver can accept/reject */}
            {req.status === "PENDING" && isReceiver && (
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

            {/*  If sender is waiting */}
            {req.status === "PENDING" && isSender && (
              <p style={{ marginTop: "10px", color: "orange" }}>
                Pending (Waiting for response)
              </p>
            )}

            {req.status === "ACCEPTED" && (
              <p style={{ marginTop: "10px", color: "green" }}>
                Friends
              </p>
            )}

            {req.status === "REJECTED" && (
              <p style={{ marginTop: "10px", color: "red" }}>
                Rejected
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
} 