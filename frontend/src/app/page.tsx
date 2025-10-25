"use client";

import Navbar from "../components/Navbar"; 
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Background slides
  const slides = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg", "/7.jpg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-purple-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
        {/* Background Slides */}
        {slides.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt={`slide-${idx}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Floating Text & Buttons */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo + Heading */}
          <div className="flex items-center justify-center space-x-4">
            <img
              src="/logo3.png" // <-- replace with your logo path
              alt="Traveller's Prism Logo"
              className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_#10B981]"
            />
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_20px_#10B981]">
              Traveller’s <span className="text-yellow-300">Prism</span>
            </h1>
          </div>

          <p className="mt-4 text-lg md:text-xl text-white drop-shadow-md">
            Connect with fellow travellers, share your stories, post events, and
            explore the world together.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {!user && (
              <>
                <Link
                  href="/signup"
                  className="px-6 py-3 bg-purple-600 text-white rounded-full shadow-[0_0_20px_#9333ea] hover:bg-purple-700 hover:shadow-[0_0_25px_#c084fc] transition duration-300"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-full shadow-[0_0_20px_#a855f7] hover:bg-white/90 hover:shadow-[0_0_25px_#c084fc] transition duration-300"
                >
                  Login
                </Link>
              </>
            )}
            {user && (
              <Link
                href={`/profile/${user.id}`}
                className="px-6 py-3 bg-green-500 text-white rounded-full shadow-[0_0_20px_#22c55e] hover:bg-green-600 hover:shadow-[0_0_25px_#4ade80] transition duration-300"
              >
                Your Profile
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-gray-900 text-white shadow-inner">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
          <Link
            href="/events"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transform transition"
          >
            <h3 className="text-xl font-bold">Discover Events</h3>
            <p className="mt-2 text-sm">Join local meetups & adventures</p>
          </Link>

          <Link
            href="/posts"
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transform transition"
          >
            <h3 className="text-xl font-bold">Share Stories</h3>
            <p className="mt-2 text-sm">Post photos, videos, and blogs</p>
          </Link>

          <Link
            href={user ? `/profile/${user.id}` : "/login"}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transform transition"
          >
            <h3 className="text-xl font-bold">Your Profile</h3>
            <p className="mt-2 text-sm">Track your journeys & activities</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center bg-black text-gray-400 text-sm">
        © {new Date().getFullYear()} Traveller Social · Sabed Bin Sarwar
      </footer>
    </div>
  );
}
