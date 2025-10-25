"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  if (!mounted) return null;

  const glowButton = "transition transform hover:scale-105 shadow-lg";

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
                className={`${glowButton} px-6 py-2 rounded-full bg-green-600 text-white shadow-green-700/80`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${glowButton} px-6 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold shadow-gray-700/80`}
              >
                Signup
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`${glowButton} px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-700/90`}
              >
                Travel Feed
              </Link>
              <button
                onClick={handleLogout}
                className={`${glowButton} px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow-red-700/90`}
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
                className={`${glowButton} w-full text-center px-6 py-2 rounded-full bg-green-500 text-white shadow-green-500/80`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className={`${glowButton} w-full text-center px-6 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold shadow-gray-400/80`}
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
                className={`${glowButton} w-full text-center px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-400/90`}
              >
                Travel Feed
              </Link>
              <button
                onClick={handleLogout}
                className={`${glowButton} w-full text-center px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow-red-500/90`}
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
