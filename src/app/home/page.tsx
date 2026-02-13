/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import "./home.css";

export default function HomePage() {
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/all-users`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        console.log("All Skills:", data);
        setSkills(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setSkills([]);
      });
  }, []);

  return (
    <div className="page-container">
      <h2>Available Skills</h2>

      <div className="card-grid">
        {skills.map((userSkill, index) => (
          <div className="skill-card" key={index}>
            <h3>{userSkill.user.username}</h3>

            <div>
              <strong>I Have:</strong>
              {userSkill.haveSkills && userSkill.haveSkills.length > 0 ? (
                <ul>
                  {userSkill.haveSkills.map((hs: any, i: number) => (
                    <li key={i}>
                      {hs.name} - {hs.experience} yrs
                      {hs.projects && ` (Project: ${hs.projects})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </div>

            <div>
              <strong>I Want:</strong>
              {userSkill.wantSkills && userSkill.wantSkills.length > 0 ? (
                <ul>
                  {userSkill.wantSkills.map((ws: any, i: number) => (
                    <li key={i}>{typeof ws === "string" ? ws : ws.name}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
