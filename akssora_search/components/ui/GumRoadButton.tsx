"use client";

import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export const GumRoadButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="bg-white rounded-md w-full sm:w-auto cursor-pointer">
      <motion.div
        whileHover={{ x: -4, y: -4 }}
        transition={{
          type: "tween",
          duration: 0.2,
          ease: "easeInOut",
        }}
        className={cn(
          "flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-md transition-all duration-200 font-medium text-xs sm:text-sm md:text-base",
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
