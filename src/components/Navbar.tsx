"use client";

import Link from "next/link";
import { memo, useState, useEffect } from "react";
import "./navbar.css";

function NavbarComponent() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/home", label: "Home" },
    { href: "/matches", label: "Matches" },
    { href: "/add-skill", label: "Add Skill" },
    { href: "/chat", label: "Chat" },
    { href: "/requests", label: "Requests" },
    { href: "/removeFriendPage", label: "Remove Friend" },
    { href: "/delete-skill", label: "Delete Skill" },
  ];

  // Always close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-logo">SkillSwap</div>

      <div
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default memo(NavbarComponent);
