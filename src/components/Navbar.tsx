"use client";

import Link from "next/link";
import "./navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">SkillSwap</div>

      <div className="nav-links">
        <Link href="/home">Home</Link>
        <Link href="/matches">Matches</Link>
        <Link href="/add-skill">Add Skill</Link>
        <Link href="/chat">Chat</Link>
      </div>
    </nav>
  );
}
