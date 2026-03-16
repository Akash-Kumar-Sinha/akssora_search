"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, VideoOff } from "lucide-react";
import { MediaCard } from "@/components/ui/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Search } from "@/components/search";
import { Headers } from "@/components/Headers";
import Upload from "@/components/upload";

type Segment = {
  end_time: number;
  score: number;
  start_time: number;
  transcript: string;
};

export type SearchResult = {
  score: number;
  type: "video" | "image" | string;
  url: string | null;
  segments?: Segment[];
  transcript?: string;
};

const segmentsToChapters = (segments?: Segment[]) => {
  if (!segments) return [];
  return segments.map((s) => ({
    time: s.start_time,
    label: s.transcript?.trim() || `${s.start_time}s – ${s.end_time}s`,
  }));
};

const ScoreBadge = ({ score }: { score: number }) => {
  const pct = Math.round(score * 100);
  const color =
    pct >= 75
      ? "text-primary border-primary/30 bg-primary/10"
      : pct >= 50
        ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
        : "text-zinc-400 border-zinc-700 bg-zinc-800/50";

  return (
    <span
      className={cn(
        "text-[10px]  font-semibold tracking-wider px-2 py-0.5 rounded-full border",
        color,
      )}
    >
      {pct}% match
    </span>
  );
};

const Workspace = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const sortedResults = results;

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <Headers />
      <Search
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        setLoading={setLoading}
        setSearched={setSearched}
        setResults={setResults}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {!searched && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center py-32 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <SearchIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Search your media
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-8">
                  Type a query above to find relevant moments in your videos and
                  images
                </p>
                <div className="max-w-xl mx-auto">
                  <Upload />
                </div>
              </div>
            </motion.div>
          )}

          {searched && loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-muted/50 border border-border overflow-hidden"
                >
                  <Skeleton
                    pattern="shimmer"
                    height="auto"
                    className="aspect-video"
                  />
                  <div className="p-3 flex items-center justify-between">
                    <Skeleton pattern="pulse" width={80} height={12} />
                    <Skeleton pattern="pulse" width={64} height={12} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {searched && !loading && sortedResults.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
                <VideoOff className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  No results found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different query or upload more media
                </p>
              </div>
            </motion.div>
          )}

          {searched && !loading && sortedResults.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-muted-foreground tracking-wide ">
                  {sortedResults.length} result
                  {sortedResults.length !== 1 ? "s" : ""} for{" "}
                  <span className="text-foreground font-semibold">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  , sorted by relevance
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                <AnimatePresence>
                  {sortedResults.map((result, i) => (
                    <motion.div
                      key={`${result.url}-${i}`}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 28,
                        delay: i * 0.05,
                      }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px]  text-muted-foreground">
                          #{i + 1}
                        </span>
                        <ScoreBadge score={result.score} />
                      </div>

                      <MediaCard
                        url={result.url ?? ""}
                        chapters={segmentsToChapters(result.segments)}
                        className="w-full"
                      />

                      {result.type === "image" && result.transcript && (
                        <p className="text-xs text-muted-foreground leading-relaxed px-1 line-clamp-3">
                          {result.transcript}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Workspace;
