"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  ZoomIn,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

export interface Chapter {
  time: number;
  label?: string;
}

interface MediaCardProps {
  url: string;
  className?: string;
  chapters?: Chapter[];
}

export const MediaCard = ({
  url,
  className,
  chapters = [],
}: MediaCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number>(-1);
  const [isMuted, setIsMuted] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideo = useMemo(() => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg") ||
      lower.includes("video")
    );
  }, [url]);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setProgress((t / video.duration) * 100);
      setCurrentTime(t);

      if (chapters.length > 0) {
        let idx = -1;
        for (let i = chapters.length - 1; i >= 0; i--) {
          if (chapters[i].time && t >= chapters[i].time) {
            idx = i;
            break;
          }
        }
        setActiveChapter(idx);
      }
    };

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentTime(video.duration);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [chapters]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(1, (e.clientX - bounds.left) / bounds.width),
    );
    videoRef.current.currentTime = pct * videoRef.current.duration;
    setProgress(pct * 100);
    setCurrentTime(pct * videoRef.current.duration);
  };

  const jumpToChapter = (time: number, index: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    setProgress((time / videoRef.current.duration) * 100);
    setActiveChapter(index);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => {
    if (isNaN(s) || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group rounded-2xl overflow-hidden bg-zinc-900 border border-white/8 shadow-lg transition-all duration-300 hover:border-white/15 hover:shadow-xl hover:shadow-black/40",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo ? (
        <>
          {/* ── Video ── */}
          <div
            className="relative cursor-pointer aspect-video bg-black"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={url}
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />

            {/* Gradient overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-300",
                isHovered || !isPlaying ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Center play/pause button */}
              {(!isPlaying || isHovered) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center transition-all duration-200",
                      "hover:bg-white/25 hover:scale-105 active:scale-95",
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" strokeWidth={2} />
                    ) : (
                      <Play
                        className="w-5 h-5 text-white translate-x-0.5"
                        strokeWidth={2}
                        fill="white"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Bottom controls */}
              <div
                className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seekbar */}
                <div
                  className="w-full h-1 bg-white/25 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all duration-150 group/seek"
                  onClick={handleSeek}
                >
                  {/* Chapter markers */}
                  {chapters.map((ch, i) => (
                    <div
                      key={i}
                      className="absolute top-0 w-0.5 h-full bg-white/50"
                      style={{ left: `${(ch.time / (duration || 1)) * 100}%` }}
                    />
                  ))}
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Time + controls row */}
                <div className="flex items-center gap-3 text-white">
                  <button
                    onClick={togglePlay}
                    className="focus:outline-none hover:opacity-75 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <Play
                        className="w-4 h-4"
                        strokeWidth={2.5}
                        fill="currentColor"
                      />
                    )}
                  </button>

                  <span className="text-[11px] font-mono tracking-wider opacity-70 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <button
                    onClick={toggleMute}
                    className="ml-auto focus:outline-none hover:opacity-75 transition-opacity"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 opacity-60" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="focus:outline-none hover:opacity-75 transition-opacity"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Chapters ── */}
          {chapters.length > 0 && (
            <div className="border-t border-white/8">
              {/* Toggle row */}
              <button
                onClick={() => setShowChapters((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                  {chapters.length} chapters
                  {activeChapter >= 0 && (
                    <span className="ml-2 text-white/70 normal-case tracking-normal font-normal truncate max-w-[120px] inline-block align-bottom">
                      · {chapters[activeChapter]?.label}
                    </span>
                  )}
                </span>
                {showChapters ? (
                  <ChevronUp className="w-3.5 h-3.5 text-white/40" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>

              {showChapters && (
                <div className="custom-scroll max-h-56 overflow-y-auto">
                  {chapters.map((chapter, i) => {
                    const isActive = i === activeChapter;
                    return (
                      <button
                        key={i}
                        onClick={() => jumpToChapter(chapter.time, i)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors border-t border-white/5",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white/90",
                        )}
                      >
                        <span className="text-[10px] font-mono tracking-wider text-white/40 pt-0.5 shrink-0 tabular-nums">
                          {formatTime(chapter.time)}
                        </span>
                        <span className="text-xs leading-snug break-words">
                          {chapter.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ── Image ── */
        <div
          className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer"
          onClick={() => setIsImageModalOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Media content"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <div className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 flex items-center justify-center hover:bg-black/70 hover:scale-105 transition-all">
              <ZoomIn className="w-4 h-4 text-white/90" />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen &&
        !isVideo &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="absolute top-4 right-4 z-[101]">
              <button
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all border border-white/20"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Full screen media"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
