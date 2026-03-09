import { EMAIL } from "@/lib/constant";
import { cn } from "../lib/utils";
import { GumRoadButton } from "./ui/GumRoadButton";
import { MailPlus } from "lucide-react";
import { AkssoraLogo } from "./Icons/AkssoraLogo";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer
      className={cn(
        "relative w-full bg-background text-foreground border-t border-white/10 overflow-hidden"
      )}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="flex justify-between flex-wrap gap-12 lg:gap-16 pb-16 border-b border-border">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div>
                <AkssoraLogo />
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  Akssora
                </span>
                <span className="text-lg font-medium text-primary ml-1">
                  Search
                </span>
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
              Akssora Search is a powerful video and image search engine that
              lets you ask questions and instantly find exact moments inside
              videos and images.
            </p>
          </div>

          <div className="h-fit">
            <GumRoadButton className="bg-primary hover:bg-primary/90 focus:ring-ring">
              <Link
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <MailPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Get in Touch</span>
                <span className="sm:hidden">Contact</span>
              </Link>
            </GumRoadButton>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Akssora Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
