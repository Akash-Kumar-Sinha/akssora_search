import { motion } from "motion/react";

export const HeaderToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className="md:hidden text-foreground focus:outline-none"
      onClick={() => onClick()}
    >
      <div className="w-6 flex flex-col items-end gap-1.5">
        <motion.span
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          className="block w-full h-0.5 bg-foreground origin-center"
        />
        <motion.span
          animate={{ opacity: isOpen ? 0 : 1 }}
          className="block w-2/3 h-0.5 bg-foreground"
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
            width: isOpen ? "100%" : "50%",
          }}
          className="block w-1/2 h-0.5 bg-foreground origin-center"
        />
      </div>
    </button>
  );
};