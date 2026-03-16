"use client";

import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import Upload, { UploadStatus } from "./upload";
import { SlideButton } from "./ui/slide-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const UploadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const isUploading = status === "uploading" || status === "processing";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <SlideButton className="flex items-center gap-2 p-2" disabled={isUploading}>
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : status === "done" ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isUploading ? "Uploading…" : status === "done" ? "Done" : "Upload"}
          </span>
        </SlideButton>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-0 overflow-hidden shadow-2xl gap-0">
        <DialogHeader className="px-6 py-5 border-b border-white/5 bg-zinc-950">
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Upload Media
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Upload onStatusChange={(s) => setStatus(s)} />
        </div>

        <div className="px-6 py-4 bg-zinc-900/50 border-t border-white/5">
          <p className="text-xs text-zinc-500 text-center">
            Max file size: 50MB. Supported formats: .jpg, .jpeg, .png, .mp4
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
