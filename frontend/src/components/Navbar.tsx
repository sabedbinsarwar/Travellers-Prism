"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-transparent text-white fixed w-full top-0 left-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-light text-2xl tracking-tight hover:text-green-200 transition transform hover:scale-105"
        >
          Traveller's Prism
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 font-light items-center">
          {!user && (
            <>
              <Link
                href="/login"
                className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-400 transition transform hover:scale-105 shadow-md font-sans"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-300 to-gray-300 text-gray-700 font-semibold hover:from-gray-400 hover:to-gray-500 transition transform hover:scale-105 shadow-md font-sans"
              >
                Signup
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-400 transition transform hover:scale-105 shadow-md font-sans"
              >
                Travel feed
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-400 transition transform hover:scale-105 shadow-md font-sans"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 shadow-md text-white font-semibold transition transform hover:scale-105 font-sans"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-white/20 transition"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800/90 px-6 py-4 flex flex-col gap-4 shadow-lg rounded-b-2xl">
          {!user && (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-400 transition shadow-md font-sans"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 font-semibold hover:from-gray-400 hover:to-gray-500 transition shadow-md font-sans"
              >
                Signup
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-400 transition shadow-md font-sans"
              >
                Dashboard
              </Link>
              <Link
                href={`/profile/${user.id}`}
                onClick={() => setMenuOpen(false)}
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-400 transition shadow-md font-sans"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 shadow-md text-white font-semibold transition font-sans"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
