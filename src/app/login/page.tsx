/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/api"; // Make sure this is your axios or fetch wrapper
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Update form state on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Make POST request to login endpoint
      const res = await apiRequest({
        url: "/auth/login",
        method: "POST",
        data: form,
      });

      // Save JWT token in localStorage if backend returns it
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      alert("Login successful!");
      router.push("/home"); // Redirect to home page
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p className="redirect">
          Don’t have an account?{" "}
          <span onClick={() => router.push("/register")}>Register</span>
        </p>
      </form>
    </div>
  );
}
