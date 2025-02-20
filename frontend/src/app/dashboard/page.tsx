"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [messages, setMessages] = useState<{ id: number; user_id: number; content: string; created_at: string }[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
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
        localStorage.setItem("user", JSON.stringify(data)); // Store only this user's data
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
    socket.emit("loadMessages");

    socket.on("messagesLoaded", (messages) => {
      setMessages(messages);
      setTimeout(scrollToBottom, 100); // Ensuring the scroll gets to exact bottom
    });

    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setTimeout(scrollToBottom, 100); // Ensuring smooth auto-scroll
    });

    return () => {
      socket.off("messagesLoaded");
      socket.off("newMessage");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const sendMessage = () => {
    if (!message.trim() || !user) return;
    socket.emit("sendMessage", { user_id: user.id, content: message });
    setMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col p-6">
      <div className="flex justify-between">
        {/* User Profile Box with Edit Button */}
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-64 flex flex-col">
          <div className="text-lg font-bold flex justify-between items-center">
            {user ? user.name : "Loading..."}
            <button onClick={() => router.push("/profile")} className="text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faUserEdit} />
            </button>
          </div>
          <p className="text-gray-400">{user ? user.email : "Loading..."}</p>
        </div>

        {/* Logout Button (Top Right) */}
        <button onClick={handleLogout} className="text-white hover:text-red-500 transition">
          <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
        </button>
      </div>

      {/* Chat Box */}
      <div className="flex flex-col flex-grow bg-gray-800 mt-4 p-4 rounded-lg overflow-y-auto scrollbar-hide" style={{ maxHeight: "70vh" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 my-2 rounded-md max-w-xs break-words ${
              msg.user_id === user?.id ? "bg-indigo-500 text-white self-end" : "bg-gray-700 text-white self-start"
            }`}
          >
            <strong>{msg.user_id === user?.id ? "You" : `User ${msg.user_id}`}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* This div helps auto-scroll */}
      </div>

      {/* Message Input */}
      <div className="mt-4 flex">
        <input
          className="flex-grow p-2 rounded-lg bg-gray-700 text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
          Send
        </button>
      </div>
    </div>
  );
}