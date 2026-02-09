/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import "./add-skill.css";

export default function AddSkillPage() {
  const [haveSkills, setHaveSkills] = useState([
    { name: "", experience: 0, projects: "" },
  ]);
  const [wantSkills, setWantSkills] = useState([""]);

  const handleHaveChange = (field: keyof typeof haveSkills[0], value: string | number) => {
    const updated = [...haveSkills];
    (updated[0][field] as any) = value;
    setHaveSkills(updated);
  };

  const handleWantChange = (value: string) => {
    setWantSkills([value]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ haveSkills, wantSkills }),
    });

    // Reset form
    setHaveSkills([{ name: "", experience: 0, projects: "" }]);
    setWantSkills([""]);
  };

  return (
    <div className="page-container">
      <h2>Add Skills</h2>
      <form className="form-box" onSubmit={handleSubmit}>
        <h3>I Have</h3>
        <input
          placeholder="Skill name"
          value={haveSkills[0].name}
          onChange={(e) => handleHaveChange("name", e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Experience"
          value={haveSkills[0].experience}
          onChange={(e) => handleHaveChange("experience", +e.target.value)}
          required
        />
        <input
          placeholder="Projects"
          value={haveSkills[0].projects}
          onChange={(e) => handleHaveChange("projects", e.target.value)}
        />

        <h3>I Want</h3>
        <input
          placeholder="Skill name"
          value={wantSkills[0]}
          onChange={(e) => handleWantChange(e.target.value)}
          required
        />

        <button type="submit">Submit Skills</button>
      </form>
    </div>
  );
}
