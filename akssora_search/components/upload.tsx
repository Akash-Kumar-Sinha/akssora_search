"use client";
import api from "@/lib/api";
import { BACKEND_URL } from "@/lib/constant";
import React, { useState } from "react";

type UploadType = "image" | "video";

const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const videoExtensions = new Set([".mp4"]);

type FileType = {
  file: File | null;
  fileType: UploadType | null;
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
};
const Upload = () => {
  const [file, setFile] = useState<FileType>({
    file: null,
    fileType: null,
    maxImageSizeMB: 5,
    maxVideoSizeMB: 100,
  });

  const handleFileImageVideoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const extension = fileName.slice(fileName.lastIndexOf("."));

    let fileType: UploadType | null = null;

    if (imageExtensions.has(extension)) {
      fileType = "image";
    } else if (videoExtensions.has(extension)) {
      fileType = "video";
    }

    if (!fileType) {
      alert("Only jpg, jpeg, png, and mp4 files are allowed.");
      return;
    }

    setFile((prev) => ({
      ...prev,
      file: selectedFile,
      fileType,
    }));
  };

  const handleUpload = async () => {
    if (!file.file) return;

    const formData = new FormData();
    formData.append("file", file.file);

    const res = await api.post(`${BACKEND_URL}/app/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    console.log(res.data);
  };

  const previewUrl = file.file ? URL.createObjectURL(file.file) : null;
  return (
    <div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.mp4"
        onChange={handleFileImageVideoUpload}
      />

      {previewUrl && file.fileType === "image" && (
        <img
          src={previewUrl}
          alt="preview"
          style={{ width: "300px", marginTop: "10px" }}
        />
      )}

      {previewUrl && file.fileType === "video" && (
        <video
          src={previewUrl}
          controls
          style={{ width: "300px", marginTop: "10px" }}
        />
      )}
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
