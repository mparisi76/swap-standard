"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import TextScaler from "./TextScaler";
import LocationPill from "./LocationPill";
import { logoutAction } from "@/app/actions/auth/logout";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

export default function Header({ user }: { user?: User | null }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <motion.header
      style={{ borderBottomWidth: 4 }}
      className="sticky top-0 z-50 bg-[#F9F8F6]/90 backdrop-blur-md border-zinc-900"
    >
      <nav className="max-w-350 mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-header font-black uppercase tracking-tighter text-zinc-900 hover:text-emerald-700 transition-colors"
        >
          <span className="flex flex-col leading-[0.6] tracking-tight">
            <span><span className="pl-4 text-[1.5em]">S</span>wap</span>
            <span><span className="text-[1.5em]">S</span>tandard</span>
            <span className="text-[0.55em] font-bold tracking-[0.2em] text-zinc-600 mt-2 normal-case">
              Built on duty of care
            </span>
          </span>
        </Link>

        <div className="flex gap-8 items-center text-label font-bold uppercase tracking-[0.2em] text-zinc-900">
          <Link
            href="/explore"
            className="hover:underline underline-offset-4 decoration-2"
          >
            Explore
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-zinc-900 text-white hover:bg-emerald-700 transition-all text-label"
          >
            Portal
          </Link>

          <Suspense fallback={null}>
            <LocationPill />
          </Suspense>
          <TextScaler />

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-900 flex items-center justify-center text-white text-[10px] font-black relative cursor-pointer"
              >
                {getInitials(user.name || "ST")}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-100">
                  <ChevronDown size={8} className="text-zinc-900" />
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2">
                  <div className="px-4 py-2 border-b-2 border-zinc-100 text-[8px] font-black text-zinc-400">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase hover:bg-zinc-50"
                  >
                    <Settings size={12} /> Settings
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut size={12} /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
