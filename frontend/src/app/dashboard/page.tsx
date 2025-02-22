"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client"; // Import Socket type

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [messages, setMessages] = useState<{ id: number; user_id: number; content: string; created_at: string }[]>([]);
  const [message, setMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store the socket instance in a useRef to persist across re-renders
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:4000", {
        transports: ["websocket"], // Enforce WebSockets for better performance
        reconnection: true, // Allow automatic reconnection
        reconnectionAttempts: 5, // Retry 5 times before failing
        reconnectionDelay: 2000, // Wait 2 seconds before reconnecting
      });
    }

    const socket = socketRef.current;

    let isMounted = true; // Track if component is still mounted

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

        if (isMounted) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          socket.emit("userConnected", data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();

    socket.emit("loadMessages");

    socket.on("messagesLoaded", (messages) => {
      if (isMounted) {
        setMessages(messages);
        setTimeout(scrollToBottom, 100);
      }
    });

    socket.on("newMessage", (newMessage) => {
      if (isMounted) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setTimeout(scrollToBottom, 100);
      }
    });

    socket.on("activeUsers", (users) => {
      if (isMounted) setActiveUsers(users);
    });

    return () => {
      isMounted = false; // Prevent state updates after unmount

      if (socketRef.current) {
        socketRef.current.off("messagesLoaded");
        socketRef.current.off("newMessage");
        socketRef.current.off("activeUsers");
        socketRef.current.disconnect(); // Properly disconnect socket
        socketRef.current = null;
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const sendMessage = () => {
    if (!message.trim() || !user) return;
    socketRef.current?.emit("sendMessage", { user_id: user.id, content: message });
    setMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        {/* User Profile Box (Left Side) */}
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-64 flex flex-col">
          <div className="text-lg font-bold flex justify-between items-center">
            {user ? user.name : "Loading..."}
            <button onClick={() => router.push("/profile")} className="text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faUserEdit} />
            </button>
          </div>
          <p className="text-gray-400">{user ? user.email : "Loading..."}</p>
        </div>

        {/* Spacer - Pushes Active Users & Logout Button to Right */}
        <div className="flex-grow"></div>

        {/* Active Users Box (Now Positioned Right Before Logout Button) */}
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-64 flex flex-col mr-4">
          <h3 className="text-lg font-bold">Active Users</h3>
          <div className="mt-2 bg-gray-700 p-2 rounded-md overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxHeight: "40px" }}>
            {activeUsers.length > 0 ? (
              activeUsers.map((username, index) => (
                <div key={index} className="text-gray-300 p-1">
                  {username}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No users online</p>
            )}
          </div>
        </div>

        {/* Logout Button (Far Right) */}
        <button onClick={handleLogout} className="text-white hover:text-red-500 transition">
          <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
        </button>
      </div>

      {/* Chat Box */}
      <div className="flex flex-col flex-grow bg-gray-800 mt-4 p-4 rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxHeight: "70vh" }}>
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
        <div ref={messagesEndRef} /> {/* Auto-Scroll Ref */}
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