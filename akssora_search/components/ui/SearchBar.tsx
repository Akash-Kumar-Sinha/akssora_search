import type { ReactNode } from "react";

interface SearchBarProps {
  children?: ReactNode;
  className?: string;
}

export const SearchBar = ({ children, className = "" }: SearchBarProps) => {
  return (
    <div
      className={`bg-foreground rounded-xl sm:rounded-2xl shadow-2xl border border-foreground/10 text-background p-1.5 sm:p-2 flex items-center gap-2 sm:gap-3 md:gap-4 relative z-20 w-full max-w-2xl ${className} `}
    >
      {children}
    </div>
  );
};
