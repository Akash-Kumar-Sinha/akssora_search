"use clent";
import { AUTH_URL } from "@/lib/constant";
import axios from "axios";
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
        console.log("Logout successful");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
    >
      Logout
    </button>
  );
};
