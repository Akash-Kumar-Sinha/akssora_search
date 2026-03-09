import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export const BorderAnimationCard = ({
  children,
  className,
  hoverClassName,
  index,
  hoveredIndex,
  layoutId = "effectas",
  setHoveredIndex,
}: {
  children: React.ReactNode;
  className?: string;
  hoverClassName?: string;
  index: number;
  layoutId?: string;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}) => {
  const isHovered = hoveredIndex === index;

  return (
    <div
      onMouseEnter={() => setHoveredIndex(index)}
      className={cn(
        "group relative w-full h-full cursor-pointer bg-white/5 backdrop-blur-sm p-8 md:p-10 border border-white/10 transition-colors duration-200 rounded-xl",
        className
      )}
    >
      {isHovered && (
        <motion.div
          layoutId={layoutId}
          className={cn(
            "absolute inset-0 pointer-events-none rounded-xl border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.6)]",
            hoverClassName
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            layout: {
              type: "spring",
              stiffness: 300,
              damping: 30,
            },
            opacity: { duration: 0.15 },
          }}
          style={{ zIndex: 50 }}
        />
      )}

      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};
