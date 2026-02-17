/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./delete-skill.css";

export default function DeleteSkillPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/my`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load skills");
        }
        setSkills(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this skill?");
    if (!confirmDelete) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    // Remove from UI
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  return (
    <div className="page-container">
      <h2>Delete Skills</h2>

      {error && <p className="error">{error}</p>}

      {skills.length === 0 && !error && <p>No skills found.</p>}

      {skills.map((skill) => (
        <div key={skill.id} className="skill-card">
          <h3>I Have</h3>
          {skill.haveSkills.map((h: any, index: number) => (
            <p key={index}>
              {typeof h === "string"
                ? h
                : `${h.name} (${h.experience} yrs)`}
            </p>
          ))}

          <h3>I Want</h3>
          {skill.wantSkills.map((w: string, index: number) => (
            <p key={index}>{w}</p>
          ))}

          <button
            className="delete-btn"
            onClick={() => handleDelete(skill.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}