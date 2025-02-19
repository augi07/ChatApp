"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from login
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
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-start justify-start p-6">
      {/* Profile Box in Top-Left */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-64">
        <div className="flex flex-col items-center space-y-2">
          {/* Name Box */}
          <div className="bg-gray-700 text-lg font-bold px-4 py-2 rounded-md w-full text-center">
            {user ? user.name : "Loading..."}
          </div>
          <p className="text-gray-400">{user ? user.email : "Loading..."}</p>
          <button
            onClick={() => router.push("/profile")}
            className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}