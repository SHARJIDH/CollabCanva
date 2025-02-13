"use client";

import { useEffect, useRef, useState } from "react";

interface SketchPadProps {
  notebookId: string;
  socketInstance: any;
  initialData?: string;
  onCanvasRefChange?: (ref: React.RefObject<HTMLCanvasElement>) => void;
}

export default function SketchPad({
  notebookId,
  socketInstance,
  initialData,
  onCanvasRefChange, // Add this prop here
}: SketchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState<"pen" | "text" | "eraser">("pen");
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.font = `${fontSize}px Arial`;
    contextRef.current = context;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }

    // Pass the canvas ref to parent component
    if (onCanvasRefChange) {
      onCanvasRefChange(canvasRef);
    }
  }, [initialData, color, lineWidth, fontSize, onCanvasRefChange]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.font = `${fontSize}px Arial`;
      contextRef.current.fillStyle = color;
    }
  }, [color, lineWidth, fontSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    if (e.type === "mousedown") {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    if (tool === "text" && textInput) {
      contextRef.current.fillText(textInput, x, y);
      setTextInput("");
      saveCanvas();
    } else if (tool === "pen" || tool === "eraser") {
      contextRef.current.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      contextRef.current.lineWidth = tool === "eraser" ? 20 : lineWidth;
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    }
    setTextPosition({ x, y });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (
      !isDrawing ||
      !contextRef.current ||
      !canvasRef.current ||
      tool === "text"
    )
      return;
    if (e.type === "mousemove") {
      e.preventDefault();
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current || !contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    saveCanvas();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (tool === "text" && contextRef.current) {
      if (e.key === "Enter") {
        contextRef.current.fillText(textInput, textPosition.x, textPosition.y);
        setTextInput("");
        saveCanvas();
      }
    }
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();

    // Emit to socket for real-time collaboration
    socketInstance?.emit("update-sketch", {
      notebookId,
      data: dataUrl,
    });

    // Save to database
    fetch(`/api/notebooks/${notebookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sketchData: dataUrl,
      }),
    }).catch((error) => {
      console.error("Error saving sketch:", error);
    });
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;
    contextRef.current.fillStyle = "white";
    contextRef.current.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    contextRef.current.fillStyle = color;
    saveCanvas();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={() => setTool("pen")}
          className={`px-4 py-2 rounded ${tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ✏️ Draw
        </button>
        <button
          onClick={() => setTool("text")}
          className={`px-4 py-2 rounded ${tool === "text" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          📝 Text
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`px-4 py-2 rounded ${tool === "eraser" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ❌ Eraser
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10"
        />
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          min="12"
          max="72"
          className="w-20 p-2 border rounded"
        />
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>
      </div>
      {tool === "text" && (
        <div className="w-full max-w-xl mb-4 flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type text and click on canvas to place it"
            className="flex-1 p-2 border rounded"
          />
          <span className="text-sm text-gray-500">
            Click anywhere on canvas to place text
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="border rounded-lg shadow-lg bg-white cursor-crosshair"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
