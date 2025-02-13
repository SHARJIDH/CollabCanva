"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadNotebook = async (
  content: string,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  title: string = "notebook",
) => {
  if (typeof window === "undefined") return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // Add text content
  const splitText = pdf.splitTextToSize(content, pageWidth - 2 * margin);
  pdf.text(splitText, margin, margin);

  // Get current y position after text
  const textHeight = pdf.getTextDimensions(splitText).h;
  let yPosition = margin + textHeight + 10;

  // Add sketch if it exists
  if (canvasRef.current) {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");

    const imageAspectRatio = canvas.width / canvas.height;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - yPosition - margin;

    let imageWidth = maxWidth;
    let imageHeight = imageWidth / imageAspectRatio;

    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
      imageWidth = imageHeight * imageAspectRatio;
    }

    if (yPosition + imageHeight > pageHeight) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.addImage(imageData, "PNG", margin, yPosition, imageWidth, imageHeight);
  }

  pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
};
