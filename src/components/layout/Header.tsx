/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Settings, LogOut, Menu, X, Flag } from "lucide-react";
import TextScaler from "./TextScaler";
import LocationPill from "./LocationPill";
import { logoutAction } from "@/app/actions/auth/logout";
import { getUserLocation } from "@/utils/location-storage";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

export default function Header({ user }: { user?: User | null }) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openedOnPathname, setOpenedOnPathname] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profileOpen = isProfileOpen && openedOnPathname === pathname;
  const [exploreHref, setExploreHref] = useState("/explore");

  useEffect(() => {
    const loc = getUserLocation();
    if (loc) {
      setExploreHref(`/explore?lat=${loc.lat}&lng=${loc.lng}&radius=${DEFAULT_RADIUS_MILES}&page=1`);
    }
  }, []);
  const mobileOpen = isMobileOpen && openedOnPathname === pathname;

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
      className="sticky top-0 z-50 bg-[#F9F8F6]/90 backdrop-blur-md border-zinc-900 h-[76px]"
    >
      <nav className="px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link
          href="/"
          className="text-header font-black uppercase tracking-tighter text-zinc-900 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center leading-0 tracking-tight">
            <span className="text-[2.25em] font-black">S</span>
            <span className="flex flex-col leading-[.8] ml-0">
              <span>wap</span>
              <span>tandard</span>
            </span>
          </span>
          <span className="block text-[0.55em] font-bold tracking-[0.2em] text-zinc-600 mt-1 normal-case">
            Built on duty of care to our earth and one another
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center text-label font-bold uppercase tracking-[0.2em] text-zinc-900">
          <Link
            href={exploreHref}
            className="hover:underline underline-offset-4 decoration-2"
          >
            Explore
          </Link>
          <Link
            href="/how-it-works"
            className="hover:underline underline-offset-4 decoration-2"
          >
            How It Works
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
                onClick={() => {
                  setIsProfileOpen(!profileOpen);
                  setOpenedOnPathname(pathname);
                }}
                className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-900 flex items-center justify-center text-white text-[10px] font-black relative cursor-pointer"
              >
                {getInitials(user.name || "ST")}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-100">
                  <ChevronDown size={8} className="text-zinc-900" />
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2">
                  <div className="px-4 py-2 border-b-2 border-zinc-100 text-[8px] font-black text-zinc-500 truncate">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase hover:bg-zinc-50"
                  >
                    <Settings size={12} /> Settings
                  </Link>
                  {user.role === "Administrator" && (
                    <Link
                      href="/admin/flags"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase hover:bg-zinc-50 text-red-600"
                    >
                      <Flag size={12} /> Flags
                    </Link>
                  )}
                  <form action={logoutAction}>
                    <input type="hidden" name="returnTo" value={pathname} />
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

        {/* Mobile: Portal link + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-zinc-900 text-white text-label font-black uppercase tracking-widest"
          >
            Portal
          </Link>
          <button
            onClick={() => {
              setIsMobileOpen(!mobileOpen);
              setOpenedOnPathname(pathname);
            }}
            className="w-10 h-10 border-2 border-zinc-900 flex items-center justify-center bg-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={18} strokeWidth={2.5} />
            ) : (
              <Menu size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t-2 border-zinc-900 bg-[#F9F8F6] md:hidden"
          >
            <div className="px-6 py-4 space-y-4">
              <Link
                href={exploreHref}
                onClick={() => setIsMobileOpen(false)}
                className="block text-body font-black uppercase tracking-widest text-zinc-900 py-2 border-b-2 border-zinc-100"
              >
                Explore
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setIsMobileOpen(false)}
                className="block text-body font-black uppercase tracking-widest text-zinc-900 py-2 border-b-2 border-zinc-100"
              >
                How It Works
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="block text-body font-black uppercase tracking-widest text-zinc-900 py-2 border-b-2 border-zinc-100"
              >
                Member Portal
              </Link>
              <div className="flex items-center justify-between py-2 border-b-2 border-zinc-100">
                <span className="text-label font-black uppercase tracking-widest text-zinc-500">
                  Location
                </span>
                <Suspense fallback={null}>
                  <LocationPill />
                </Suspense>
              </div>
              <div className="flex items-center justify-between py-2 border-b-2 border-zinc-100">
                <span className="text-label font-black uppercase tracking-widest text-zinc-500">
                  Text Size
                </span>
                <TextScaler />
              </div>
              {user && (
                <div className="pt-2 space-y-3">
                  <p className="font-mono text-detail text-zinc-500 uppercase tracking-widest">
                    {user.email}
                  </p>
                  <form action={logoutAction}>
                    <input type="hidden" name="returnTo" value={pathname} />
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-label font-black uppercase tracking-widest text-red-600 cursor-pointer"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
