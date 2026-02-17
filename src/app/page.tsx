"use client";

import { useRouter } from "next/navigation";
import "./home.css"

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Skill-Swap Hub</h1>

        <p>
          A platform where people exchange skills instead of money.
          Connect, chat, learn, and grow together.
        </p>

        <div className="button-group">
          <button onClick={() => router.push("/login")}>
            Login
          </button>

          <button onClick={() => router.push("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}  