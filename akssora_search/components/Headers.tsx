import React from "react";
import { Login } from "./Login";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo/Logo";
import Link from "next/link";
import Upload from "./upload";

export const Headers = () => {
  const primary = "#2196F3";
  return (
    <div className="w-full bg-zinc-950 border-b border-white/[0.06]">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 h-14">
        <Link
          href="/"
          className="group flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-300 shrink-0"
        >
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ "--p": primary } as React.CSSProperties}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                "bg-(--p)/30",
              )}
            />
            <Logo
              className={cn(
                "relative w-6 h-6 text-white/70 transition-colors duration-300",
                "group-hover:text-(--p)",
              )}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-white text-sm sm:text-[15px] tracking-widest uppercase leading-none">
              Akssora
            </span>
            <span className="text-primary font-semibold text-sm sm:text-[15px] tracking-widest uppercase leading-none">
              Search
            </span>
            <span className="hidden md:block w-px h-3 bg-white/35 mx-0.5" />
            <span className="hidden md:block text-[10px] text-white/50 font-medium tracking-[0.2em] uppercase leading-none">
              Video Search Engine
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 min-w-0 mx-4">
          <Upload />
        </div>

        <div className="shrink-0">
          <Login />
        </div>
      </div>

      <div className="md:hidden px-4 pb-3">
        <Upload />
      </div>
    </div>
  );
};
