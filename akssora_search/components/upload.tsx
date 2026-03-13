"use client";

import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constant";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { SlideButton } from "@/components/ui/slide-button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type UploadType = "image" | "video";
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const videoExtensions = new Set([".mp4"]);

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

const Upload = () => {
  const [value, setValue] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ file: File; fileType: UploadType } | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSetValue = (files: File[]) => {
    setValue(files);
    const f = files[0];
    if (!f) { setSelectedFile(null); return; }

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

      setTimeout(() => {
        setStatus("idle");
      }, 3000);

    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Upload failed. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const isUploading = status === "uploading" || status === "processing";

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col gap-3 w-full max-w-3xl">
        <div className="flex items-center gap-2">
          <FileUpload
            value={value}
            onChange={handleSetValue}
            maxFiles={1}
            disabled={isUploading}
          />

          <SlideButton
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || status === "done"}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Uploading…
              </span>
            ) : status === "done" ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Done
              </span>
            ) : (
              "UPLOAD"
            )}
          </SlideButton>
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-zinc-900/60 border border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;

