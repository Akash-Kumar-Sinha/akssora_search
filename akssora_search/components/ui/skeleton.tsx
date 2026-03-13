import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SkeletonPattern = "pulse" | "shimmer" | "wave" | "glimmer";

type SkeletonProps = {
  pattern?: SkeletonPattern;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  animate?: boolean;
};

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      pattern = "pulse",
      width = "100%",
      height = 24,
      lines = 0,
      animate = true,
      className,
    },
    ref,
  ) => {
    const baseBackgroundColor = "rgba(255, 255, 255, 0.05)";
    const accentColor = "rgba(255, 255, 255, 0.1)";

    const renderPulse = () => (
      <motion.div
        className="w-full h-full rounded-md"
        style={{ backgroundColor: baseBackgroundColor }}
        animate={
          animate
            ? {
                opacity: [0.5, 1, 0.5],
              }
            : {}
        }
        transition={
          animate
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      />
    );

    const renderShimmer = () => (
      <div
        className="w-full h-full rounded-md relative overflow-hidden"
        style={{ backgroundColor: baseBackgroundColor }}
      >
        {animate && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            }}
            animate={{ left: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>
    );

    const renderWave = () => (
      <div
        className="w-full h-full rounded-md relative overflow-hidden"
        style={{ backgroundColor: baseBackgroundColor }}
      >
        {animate &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                transform: "translateX(-100%)",
              }}
              animate={{
                transform: ["translateX(-100%)", "translateX(100%)"],
              }}
              transition={{
                duration: 1.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
      </div>
    );

    const renderGlimmer = () => (
      <motion.div
        className="w-full h-full rounded-md"
        style={{ backgroundColor: baseBackgroundColor }}
        animate={
          animate
            ? {
                boxShadow: [
                  `0 0 0px ${baseBackgroundColor}`,
                  `0 0 20px ${accentColor}`,
                  `0 0 0px ${baseBackgroundColor}`,
                ],
                opacity: [0.5, 1, 0.5],
              }
            : {}
        }
        transition={
          animate
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      />
    );

    const renderPattern = () => {
      switch (pattern) {
        case "pulse":
          return renderPulse();
        case "shimmer":
          return renderShimmer();
        case "wave":
          return renderWave();
        case "glimmer":
          return renderGlimmer();
        default:
          return renderPulse();
      }
    };

    const renderLines = () => {
      if (lines <= 0) return null;

      return (
        <div className="flex flex-col gap-3 mt-4 w-full">
          {Array.from({ length: lines }).map((_, i) => {
            let lineWidth = "100%";
            if (i === lines - 1) {
              lineWidth = "75%";
            } else if (i % 2 !== 0) {
              lineWidth = "85%";
            }

            return (
              <div key={i} style={{ width: lineWidth, height: 12 }}>
                {renderPattern()}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start justify-start relative",
          className,
        )}
        style={{ width }}
      >
        <div style={{ width: "100%", height }}>{renderPattern()}</div>
        {renderLines()}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";
