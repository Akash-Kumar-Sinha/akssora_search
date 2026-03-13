"use client";
import { AUTH_URL } from "@/lib/constant";
import axios from "axios";
import { LogOut } from "lucide-react";
import React from "react";

export const Logout = () => {
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${AUTH_URL}/logout`,
        {},
        { withCredentials: true },
      );
      if (res.status === 200) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
};
