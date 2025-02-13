// app/components/download-button.tsx
"use client";

import { Download } from "lucide-react";
import { downloadNotebook } from "../lib/download-utils";

interface DownloadButtonProps {
  content: string;
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  title: string;
}

export function DownloadButton({
  content,
  canvasRef,
  title,
}: DownloadButtonProps) {
  return (
    <button
      onClick={() => {
        if (canvasRef) {
          downloadNotebook(content, canvasRef, title);
        }
      }}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
    >
      <Download className="h-5 w-5" />
      Download
    </button>
  );
}
