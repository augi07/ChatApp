"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, redirecting to login...");
          return;
        }

        const res = await fetch("http://localhost:4000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setForm({ name: data.name, email: data.email, password: "" });
        setOriginalData({ name: data.name, email: data.email, password: "" }); // Store initial data
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user made changes
    if (
      form.name === originalData.name &&
      form.email === originalData.email &&
      form.password === ""
    ) {
      alert("No changes were made!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, cannot update user.");
        return;
      }

      const res = await fetch("http://localhost:4000/api/auth/update-user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to update user");

      // Store updated info in localStorage
      localStorage.setItem("user", JSON.stringify({ name: form.name, email: form.email }));

      alert("Profile updated successfully!");
      router.push("/dashboard"); // Redirect after saving
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg relative">
        {/* Back Button */}
        <button
          className="absolute top-4 left-4 text-gray-300 hover:text-white"
          onClick={() => router.push("/dashboard")}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>

        <h2 className="text-2xl font-bold text-center">Edit Profile</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            placeholder="Name"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (leave blank to keep current)"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 rounded hover:bg-indigo-600"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}