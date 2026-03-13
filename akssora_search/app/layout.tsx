import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicHeader } from "@/components/ui/dynamic-header";
import { Login } from "@/components/Login";

const NAV_ITEMS = [
  {
    title: "About",
    href: "/about",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    description: "Akssora Search",
  },
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video Search Engine - Find Exact Moments Instantly",
  description:
    "Ask questions and instantly find the exact moments inside a video. Search videos like documents with natural language queries and semantic understanding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-background selection:text-primary`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col">
            <DynamicHeader nav_items={NAV_ITEMS}>
              <Login />
            </DynamicHeader>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
