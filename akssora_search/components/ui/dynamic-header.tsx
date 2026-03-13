"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo/Logo";

interface NavItem {
  title: string;
  href: string;
  image: string;
  description: string;
}

interface DynamicHeaderProps {
  nav_items: NavItem[];
  children?: React.ReactNode;
  primary?: string;
}

export const DynamicHeader = ({
  nav_items,
  children,
  primary = "#2196F3",
}: DynamicHeaderProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
        setIsMobileOpen(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -120, opacity: isVisible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <motion.nav
        layout
        className={cn(
          "pointer-events-auto relative flex flex-col bg-black/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
          isMobileOpen ? "w-full md:w-auto rounded-4xl" : "w-auto rounded-full",
        )}
      >
        <div className="flex items-center justify-between w-full px-2 py-1">
          <Link
            href="/"
            className="group flex items-center gap-1.5 md:gap-2.5 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
          >
            <div
              className="relative flex items-center justify-center shrink-0"
              style={{ "--p": primary } as React.CSSProperties}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  "bg-(--p)/20",
                )}
              />
              <Logo
                className={cn(
                  "relative w-6 h-6 text-foreground transition-colors duration-300",
                  "group-hover:text-(--p)",
                )}
              />
            </div>
            <div className="flex flex-col justify-center ml-1 md:ml-2 transition-colors duration-300">
              <span className="font-bold text-white tracking-[0.15em] text-[13px] sm:text-[15px] uppercase leading-none mb-1">
                Akssora
              </span>
              <span className="text-[10px] text-white/50 font-medium tracking-[0.25em] uppercase leading-none">
                UI Library
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 pl-3">
            {nav_items.map((item, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={item.title}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    "relative flex items-center rounded-4xl cursor-pointer group/nav",
                    isHovered ? "text-white" : "text-white/60",
                  )}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="header-spotlight"
                      className="absolute inset-0 bg-white/10 rounded-full z-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Link
                    href={item.href}
                    className="relative z-10 flex items-center py-1.5 px-3 h-9 overflow-hidden"
                  >
                    <span className="text-sm font-medium transition-colors whitespace-nowrap group-hover/nav:text-white text-white/60">
                      {item.title}
                    </span>

                    <AnimatePresence mode="popLayout">
                      {isHovered && (
                        <motion.div
                          initial={{ width: 0, opacity: 0, scale: 0.85 }}
                          animate={{ width: 180, opacity: 1, scale: 1 }}
                          exit={{ width: 0, opacity: 0, scale: 0.85 }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className="overflow-hidden relative flex items-center"
                        >
                          <div className="h-9 w-[168px] ml-3 rounded-full overflow-hidden relative shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3 transition-colors hover:bg-black/20">
                              <span className="text-[11px] text-white font-semibold uppercase tracking-wider">
                                {item.description}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block ml-3 mr-1">
            {children ?? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold whitespace-nowrap"
              >
                Get Template
              </motion.button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden ml-2 sm:ml-4 mr-1 sm:mr-2 p-4 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X className="w-6 h-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              layout
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 40 }}
              className="md:hidden w-full overflow-hidden"
            >
              <div className="flex flex-col p-3 gap-2">
                {nav_items.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.06,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="group relative flex items-end justify-between h-20 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-active:opacity-50 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />
                      <div className="relative z-10 px-4 pb-3">
                        <p className="text-white font-bold text-xl tracking-tight leading-none">
                          {item.title}
                        </p>
                        <p className="text-white/50 text-xs font-medium tracking-widest uppercase mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <div className="relative z-10 p-4 pb-3 shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: nav_items.length * 0.06,
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="mt-1"
                >
                  {children ?? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="px-5 py-2 rounded-full w-full bg-white text-black text-sm font-bold whitespace-nowrap"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Get Template
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
};

export default DynamicHeader;
