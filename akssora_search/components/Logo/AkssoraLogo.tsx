import Link from "next/link";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export const AkssoraLogo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-1.5 text-foreground hover:text-foreground/80 transition-colors duration-200 group",
        className,
      )}
    >
      <Logo className="h-7 w-7 " />
      <div className="flex items-baseline font-bold">
        <span className="text-secondary-foreground group-hover:text-foreground text-base sm:text-lg font-bold tracking-tight">
          Akssora
        </span>
        <span className="text-base sm:text-lg group-hover:font-bold font-medium text-primary ml-0.5">
          UI
        </span>
      </div>
    </Link>
  );
};
