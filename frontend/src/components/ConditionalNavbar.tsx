// components/ConditionalNavbar.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname === "/signup" || pathname === "/login" ||pathname==="/dashboard") return null;
  return <Navbar />;
}
