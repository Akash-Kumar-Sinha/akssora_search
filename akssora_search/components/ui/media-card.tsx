"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  Maximize,
  Minimize,
  ZoomIn,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "group rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800",
        "shadow-lg transition-all duration-300",
        "hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-950/60",
        "w-full",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVideo ? (
        <>
          {/* Video */}
          <div
            className="relative cursor-pointer aspect-video bg-zinc-950"
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
            <motion.div
              animate={{ opacity: isHovered || !isPlaying ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/10 to-transparent"
            >
              {/* Center play/pause */}
              <AnimatePresence>
                {(!isPlaying || isHovered) && (
                  <motion.div
                    key="playpause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
                        "bg-zinc-800/80 backdrop-blur-sm border border-zinc-600/50",
                        "flex items-center justify-center",
                      )}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isPlaying ? (
                          <motion.span
                            key="pause"
                            initial={{ opacity: 0, rotate: -10 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 10 }}
                            transition={{ duration: 0.12 }}
                          >
                            <Pause
                              className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-100"
                              strokeWidth={2}
                            />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="play"
                            initial={{ opacity: 0, rotate: 10 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -10 }}
                            transition={{ duration: 0.12 }}
                          >
                            <Play
                              className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-100 translate-x-0.5"
                              strokeWidth={2}
                              fill="currentColor"
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom controls */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: isHovered || !isPlaying ? 1 : 0,
                  y: isHovered || !isPlaying ? 0 : 8,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute bottom-0 inset-x-0 p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seekbar */}
                <div
                  className="relative w-full h-1 bg-zinc-700/60 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all duration-150"
                  onClick={handleSeek}
                >
                  {chapters.map((ch, i) => (
                    <div
                      key={i}
                      className="absolute top-0 w-px h-full bg-zinc-400/50 z-10"
                      style={{ left: `${(ch.time / (duration || 1)) * 100}%` }}
                    />
                  ))}
                  <motion.div
                    className="h-full bg-zinc-200 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>

                {/* Time + controls row */}
                <div className="flex items-center gap-2 sm:gap-3 text-zinc-200">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={togglePlay}
                    className="focus:outline-none hover:text-white transition-colors shrink-0"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isPlaying ? (
                        <motion.span
                          key="p"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Pause
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            strokeWidth={2.5}
                          />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="pl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Play
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            strokeWidth={2.5}
                            fill="currentColor"
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-zinc-400 tabular-nums">
                    {formatTime(currentTime)}
                    <span className="hidden xs:inline">
                      {" "}
                      / {formatTime(duration)}
                    </span>
                  </span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={toggleMute}
                    className="ml-auto focus:outline-none hover:text-white transition-colors shrink-0"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isMuted ? (
                        <motion.span
                          key="muted"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 4 }}
                          transition={{ duration: 0.12 }}
                        >
                          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="unmuted"
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={toggleFullscreen}
                    className="focus:outline-none hover:text-white transition-colors shrink-0"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isFullscreen ? (
                        <motion.span
                          key="min"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="max"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.12 }}
                        >
                          <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {chapters.length > 0 && (
            <div className="border-t border-zinc-800">
              <motion.button
                whileTap={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                onClick={() => setShowChapters((v) => !v)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-left bg-zinc-950 hover:bg-zinc-900 transition-colors"
              >
                <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  {chapters.length} chapters
                  {activeChapter >= 0 && (
                    <span className="ml-2 text-zinc-400 normal-case tracking-normal font-normal truncate max-w-[100px] sm:max-w-[160px] inline-block align-bottom">
                      · {chapters[activeChapter]?.label}
                    </span>
                  )}
                </span>
                <motion.span
                  animate={{ rotate: showChapters ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  style={{ display: "flex" }}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                </motion.span>
              </motion.button>

              <AnimatePresence initial={false}>
                {showChapters && (
                  <motion.div
                    key="chapters"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="custom-scroll max-h-44 sm:max-h-56 overflow-y-auto bg-zinc-950">
                      {chapters.map((chapter, i) => {
                        const isActive = i === activeChapter;
                        return (
                          <motion.button
                            key={i}
                            layout
                            onClick={() => jumpToChapter(chapter.time, i)}
                            whileTap={{
                              backgroundColor: isActive
                                ? ""
                                : "rgba(255,255,255,0.05)",
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left border-t border-zinc-800/50 transition-colors",
                              isActive
                                ? "bg-zinc-800/80 text-zinc-100"
                                : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300",
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-chapter-bar"
                                className="w-0.5 h-4 bg-zinc-400 rounded-full shrink-0"
                                transition={{
                                  duration: 0.2,
                                  ease: "easeInOut",
                                }}
                              />
                            )}
                            <span
                              className={cn(
                                "text-[10px] font-mono tracking-wider pt-px shrink-0 tabular-nums",
                                isActive ? "text-zinc-400" : "text-zinc-600",
                              )}
                            >
                              {formatTime(chapter.time)}
                            </span>
                            <span className="text-[11px] sm:text-xs leading-snug break-words">
                              {chapter.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        <div
          className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer"
          onClick={() => setIsImageModalOpen(true)}
        >
          <motion.img
            src={url}
            alt="Media content"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-zinc-950/30"
          />
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
            transition={{ duration: 0.3 }}
            className="absolute top-2 right-2 sm:top-3 sm:right-3"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="bg-zinc-950/70 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800/80 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-200" />
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen &&
        !isVideo &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-3 sm:p-6"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[101]"
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 sm:p-2.5 bg-zinc-800 text-zinc-200 rounded-full hover:bg-zinc-700 transition-all border border-zinc-700"
                onClick={() => setIsImageModalOpen(false)}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </motion.div>
            <motion.img
              src={url}
              alt="Full screen media"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-full max-h-[88vh] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl shadow-zinc-950 cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>,
          document.body,
        )}
    </motion.div>
  );
};
