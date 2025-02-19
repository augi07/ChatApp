"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // Save the token
        alert("Login successful!");
        window.location.href = "/dashboard"; // Redirect to dashboard after login
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="max-w-lg w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-white">Welcome Back to Messinger</h2>
          <p className="mt-4 text-center text-gray-400">Sign in to continue</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                autoComplete="email"
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                autoComplete="current-password"
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
              Sign In
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <a href="/register" className="text-indigo-500 hover:text-indigo-400 font-medium">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}