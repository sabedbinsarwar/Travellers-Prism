"use client";

import { useState } from "react";
import api from "../../utils/axiosInstance";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Login failed");
      setMessageType("error");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 bg-gray-900 flex flex-col items-start justify-center px-8 relative">
        {/* Minimal Back Button */}
        <Link
          href="/"
          className="absolute top-11 left-15 w-10 h-10 bg-green-600/90 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="w-full max-w-md space-y-6 mx-auto">
          <h2 className="text-3xl font-light text-white">Welcome Traveller</h2>
          <form onSubmit={handleLogin} className="space-y-4">
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
              Login
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
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="w-1/2 hidden md:block">
        <img
          src="/login.jpg" // replace with your image
          alt="Login Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
