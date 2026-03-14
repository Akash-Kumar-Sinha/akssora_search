"use client";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constant";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { SlideButton } from "@/components/ui/slide-button";
import { CheckCircle2, XCircle, Loader2, UploadCloud } from "lucide-react";

type UploadType = "image" | "video";
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const videoExtensions = new Set([".mp4"]);
type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

const Upload = () => {
  const [value, setValue] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    fileType: UploadType;
  } | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSetValue = (files: File[]) => {
    setValue(files);
    const f = files[0];
    if (!f) {
      setSelectedFile(null);
      return;
    }
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (imageExtensions.has(ext)) {
      setSelectedFile({ file: f, fileType: "image" });
    } else if (videoExtensions.has(ext)) {
      setSelectedFile({ file: f, fileType: "video" });
    } else {
      setSelectedFile(null);
    }
    setStatus("idle");
    setErrorMsg(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("file", selectedFile.file);
    try {
      setStatus("processing");
      const res = await api.post(`${BACKEND_URL}/app/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log("Upload response:", res.data);
      setStatus("done");
      setValue([]);
      setSelectedFile(null);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Upload failed. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const isUploading = status === "uploading" || status === "processing";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <FileUpload
            value={value}
            onChange={handleSetValue}
            maxFiles={1}
            disabled={isUploading}
          />
        </div>
        <SlideButton
          onClick={handleUpload}
          disabled={isUploading || !selectedFile || status === "done"}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span className="hidden sm:inline">Uploading…</span>
            </span>
          ) : status === "done" ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Done</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">UPLOAD</span>
              <span className="sm:hidden">
                <UploadCloud />
              </span>
            </span>
          )}
        </SlideButton>
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2 px-3 py-2 mt-2 rounded-xl bg-zinc-900/60 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm text-red-400 line-clamp-2">
            {errorMsg}
          </span>
        </div>
      )}
    </div>
  );
};

export default Upload;
