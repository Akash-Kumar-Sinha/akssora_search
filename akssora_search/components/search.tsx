import React, { useRef } from "react";
import { motion } from "motion/react";
import { BACKEND_URL } from "@/lib/constant";
import { SearchResult } from "@/app/workspace/page";
import api from "@/lib/api";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSearched: React.Dispatch<React.SetStateAction<boolean>>;
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
}
export const Search = ({
  searchQuery,
  setSearchQuery,
  loading,
  setLoading,
  setSearched,
  setResults,
}: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get(`${BACKEND_URL}/app/search`, {
        params: { searchQuery },
      });
      const sorted = (res.data.results ?? []).sort(
        (a: SearchResult, b: SearchResult) => b.score - a.score,
      );
      console.log("Search results:", sorted);
      setResults(sorted);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 pt-20 flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            placeholder="Search across your media…"
            className="w-full bg-muted/60 border border-border hover:border-ring/40 focus:border-ring rounded-full pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-200"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SearchIcon className="w-4 h-4" />
          )}
          {loading ? "Searching…" : "Search"}
        </motion.button>
      </div>
    </div>
  );
};
