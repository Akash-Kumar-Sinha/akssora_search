import Footer from "@/components/Footer";
import { Searchbarui } from "@/components/Searchbarui";
import { Meteors } from "@/components/ui/meteors";

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
  {
    title: "Workspace",
    href: "/workspace",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2564&auto=format&fit=crop",
    description: "Akssora Search",
  }
];

export default function Home() {
  const useCases = [
    {
      question: "Where in this lecture is quantum entanglement explained?",
      timestamp: "Jump to 14:32",
    },
    {
      question: "Find me the boy in red shirt in this video?",
      timestamp: "Found at 8:15",
    },
    {
      question: "Show me when the speaker demonstrates the API integration",
      timestamp: "Multiple moments: 3:47, 12:03, 18:21",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <DynamicHeader nav_items={NAV_ITEMS}>
        <Login />
      </DynamicHeader>
      <main className="mx-auto w-full max-w-6xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <Meteors />
        <section className="relative mb-32 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

          <div className="relative mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Ultimate Video and Image Search Engine
            </h1>
            <section id="search" className="mb-16 sm:mb-20 md:mb-24 lg:mb-40">
              <Searchbarui />
            </section>
            <p className="mt-32 sm:mt-24 md:mt-20 lg:mt-16 mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Search videos like documents. Query by content, not timestamps.
              Get instant answers with exact moment locations.
            </p>
          </div>
        </section>

        <section className="mb-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-primary sm:text-4xl">
              The Problem
            </h2>
            <p className="mb-8 text-center text-lg leading-relaxed text-muted-foreground">
              Videos are information-dense but impossible to search. Current
              players force you to:
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="group rounded-lg border border-border bg-muted p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <p className="font-medium text-foreground">
                  Manually scrub timelines
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Wasting time searching for specific moments
                </p>
              </div>
              <div className="group rounded-lg border border-border bg-muted p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <p className="font-medium text-foreground">
                  Rely on unreliable captions
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Auto-generated text that misses context
                </p>
              </div>
              <div className="group rounded-lg border border-border bg-muted p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <p className="font-medium text-foreground">
                  Watch entire videos
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Just to find one relevant piece of information
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-foreground sm:text-4xl">
              Example Queries
            </h2>
            <p className="mb-12 text-center text-lg leading-relaxed text-muted-foreground">
              Real queries. Real use cases. Instant results.
            </p>
            <div className="space-y-4">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-base font-medium text-foreground">
                    {useCase.question}
                  </p>
                  <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                    {useCase.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
