"use client";

import { motion, AnimatePresence, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { SearchIcons } from "../components/Icons/SearchIcons";
import { SearchBar } from "../components/ui/SearchBar";

const searchQueries = [
  "Find the moment the dog jumps",
  "Show me people laughing at a party",
  "Locate the red car turning left",
  "Search for 'sunset over the ocean'",
];

const resultsByQuery = [
  [
    {
      id: 1,
      color: "bg-blue-100",
      label: "00:12",
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      color: "bg-amber-100",
      label: "01:45",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      color: "bg-green-100",
      label: "02:30",
      image:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    },
  ],
  [
    {
      id: 4,
      color: "bg-purple-100",
      label: "00:45",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      color: "bg-pink-100",
      label: "01:20",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      color: "bg-rose-100",
      label: "03:15",
      image:
        "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&h=300&fit=crop",
    },
  ],
  [
    {
      id: 7,
      color: "bg-red-100",
      label: "00:08",
      image:
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      color: "bg-orange-100",
      label: "02:10",
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    },
    {
      id: 9,
      color: "bg-yellow-100",
      label: "04:22",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop",
    },
  ],
  [
    {
      id: 10,
      color: "bg-sky-100",
      label: "00:30",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
    },
    {
      id: 11,
      color: "bg-indigo-100",
      label: "01:55",
      image:
        "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=400&h=300&fit=crop",
    },
    {
      id: 12,
      color: "bg-violet-100",
      label: "03:40",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    },
  ],
];

export const Searchbarui = () => {
  const [currentQuery, setCurrentQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [queryIndex, setQueryIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const currentFullQuery = searchQueries[queryIndex];
    let timeout: ReturnType<typeof setTimeout>;

    const typeSpeed = 50 + Math.random() * 50;
    const deleteSpeed = 30;
    const pauseEnd = 2000;
    const pauseStart = 500;

    if (!isDeleting && currentQuery === currentFullQuery) {
      setShowResults(true);
      timeout = setTimeout(() => {
        setShowResults(false);
        setIsDeleting(true);
      }, pauseEnd);
    } else if (isDeleting && currentQuery === "") {
      setIsDeleting(false);
      setQueryIndex((prev) => (prev + 1) % searchQueries.length);
      timeout = setTimeout(() => {}, pauseStart);
    } else {
      timeout = setTimeout(
        () => {
          const nextQuery = isDeleting
            ? currentFullQuery.substring(0, currentQuery.length - 1)
            : currentFullQuery.substring(0, currentQuery.length + 1);
          setCurrentQuery(nextQuery);
        },
        isDeleting ? deleteSpeed : typeSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [currentQuery, isDeleting, queryIndex]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 10,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex justify-center items-center bg-background w-full relative px-4 py-8 sm:px-6 lg:px-8">
      <SearchBar>
        <div className="text-muted-foreground pl-2 sm:pl-3 md:pl-4">
          <SearchIcons />
        </div>
        <div className="flex-1 text-left h-8 sm:h-10 md:h-12 flex items-center text-sm sm:text-base md:text-lg  font-medium overflow-hidden whitespace-nowrap selection:bg-foreground">
          {currentQuery}
          <span className="animate-pulse text-primary">|</span>
        </div>
      </SearchBar>

      <AnimatePresence>
        {showResults && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8 w-full max-w-2xl bg-card rounded-2xl shadow-xl border border-border p-4 z-10 grid grid-cols-3 gap-4"
          >
            {resultsByQuery[queryIndex].map((res) => (
              <motion.div
                key={res.id}
                variants={itemVariants}
                className={`aspect-video rounded-lg ${res.color} relative overflow-hidden group cursor-pointer `}
              >
                <img
                  src={res.image}
                  alt={res.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
                  {res.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
