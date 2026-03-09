"use client";

import React, { useRef, useState } from "react";
import { Header } from "@/components/Header";
import Upload from "@/components/upload";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constant";

type Segment = {
  end_time: number;
  score: number;
  start_time: number;
  transcript: string;
};

type SearchResult = {
  score: number;
  type: "video" | "image" | string;
  url: string | null;
  segments?: Segment[];
  transcript?: string;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const VideoCard = ({ result }: { result: SearchResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  const seekTo = (startTime: number, index: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
      setActiveSegment(index);
    }
  };

  const validSegments = result.segments?.filter((s) => s.transcript?.trim()) ?? [];

  return (
    <div style={{
      background: "#0f0f0f",
      border: "1px solid #1e1e1e",
      borderRadius: "12px",
      overflow: "hidden",
      fontFamily: "'DM Mono', monospace",
    }}>
      {/* Video player */}
      <div style={{ position: "relative", background: "#000", aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          src={result.url ?? ""}
          controls
          style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
        />
      </div>

      {/* Segments */}
      {validSegments.length > 0 && (
        <div style={{ padding: "16px" }}>
          <p style={{ color: "#555", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Relevant segments
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {validSegments.map((seg, i) => (
              <button
                key={i}
                onClick={() => seekTo(seg.start_time, i)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: activeSegment === i ? "#1a1a2e" : "#141414",
                  border: activeSegment === i ? "1px solid #4f46e5" : "1px solid #1e1e1e",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#4f46e5")}
                onMouseLeave={e => { if (activeSegment !== i) e.currentTarget.style.borderColor = "#1e1e1e"; }}
              >
                <span style={{
                  background: "#4f46e5",
                  color: "#fff",
                  fontSize: "10px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginTop: "1px",
                }}>
                  ▶ {formatTime(seg.start_time)}
                </span>
                <span style={{ color: "#aaa", fontSize: "12px", lineHeight: "1.5" }}>
                  {seg.transcript}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageCard = ({ result }: { result: SearchResult }) => (
  <div style={{
    background: "#0f0f0f",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    overflow: "hidden",
  }}>
    <img
      src={result.url ?? ""}
      alt="result"
      style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: "320px" }}
    />
    {result.transcript && (
      <p style={{ color: "#aaa", fontSize: "12px", padding: "12px 16px", margin: 0 }}>
        {result.transcript}
      </p>
    )}
  </div>
);

const Workspace = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`${BACKEND_URL}/app/search`, {
        params: { searchQuery },
      });
      setResults(res.data.results ?? []);
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
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');`}</style>
      <Header />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Search bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          <input
            type="text"
            placeholder="Search across your media..."
            style={{
              flex: 1,
              background: "#111",
              border: "1px solid #222",
              borderRadius: "8px",
              color: "#fff",
              padding: "12px 16px",
              fontSize: "13px",
              fontFamily: "'DM Mono', monospace",
              outline: "none",
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: loading ? "#1e1e1e" : "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "12px",
              fontFamily: "'DM Mono', monospace",
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "searching..." : "search →"}
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {loading ? (
              <p style={{ color: "#444", fontSize: "12px" }}>Loading...</p>
            ) : results.length === 0 ? (
              <p style={{ color: "#444", fontSize: "12px" }}>No results found.</p>
            ) : (
              <div>
                <p style={{ color: "#444", fontSize: "11px", marginBottom: "20px", letterSpacing: "0.05em" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {results.map((result, i) =>
                    result.type === "video"
                      ? <VideoCard key={i} result={result} />
                      : <ImageCard key={i} result={result} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "60px" }}>
          <Upload />
        </div>
      </main>
    </div>
  );
};

export default Workspace;