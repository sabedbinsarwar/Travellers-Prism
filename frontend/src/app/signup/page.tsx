"use client";

import { useState } from "react";
import api from "../../utils/axiosInstance";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !password) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Signup successful! Please login.");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Signup failed");
      setMessageType("error");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Image */}
      <div className="w-1/2 relative hidden md:block">
        <img
          src="/signup.jpg"
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
        {/* Minimal Back Button */}
        <Link
          href="/"
          className="absolute top-11 left-15 w-10 h-10 bg-green-600/90 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Right Side: Signup Form */}
      <div className="w-full md:w-1/2 bg-gray-900 flex items-center justify-center px-8">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-light text-white">Let's join the journey</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600 transition transform hover:scale-105">
              Sign Up
            </button>
          </form>

          {/* Inline Message */}
          {message && (
            <p
              className={`text-center font-medium ${
                messageType === "success" ? "text-green-400" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-center text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
