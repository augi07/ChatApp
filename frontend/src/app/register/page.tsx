"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
  
      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "/"; // Redirect to login page after registration
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Registration failed!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration.");
    }
  };  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="max-w-lg w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-white">Create an Account</h2>
          <p className="mt-4 text-center text-gray-400">Sign up to get started</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                onChange={handleChange}
                className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
              Sign Up
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700 text-center">
          <span className="text-gray-400">Already have an account? </span>
          <a href="/" className="text-indigo-500 hover:text-indigo-400 font-medium">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}