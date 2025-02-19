"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from login
        if (!token) {
          console.error("No token found, redirecting to login...");
          router.push("/"); // Redirect to main login page (localhost:3000)
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

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the authentication token
    localStorage.removeItem("user");  // Remove user data
    router.push("/"); // Redirect to the main login page (localhost:3000)
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-start justify-between p-6">
      {/* Profile Box in Top-Left */}
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-64 self-start">
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

      {/* Logout Button (Top Right) */}
      <button onClick={handleLogout} className="text-white hover:text-red-500 transition self-start">
        <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
      </button>
    </div>
  );
}