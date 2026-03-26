"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  aspect: number;
  shape: "rect" | "round";
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({ imageSrc, aspect, shape, onConfirm, onCancel }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop area size (fixed in the modal)
  const cropSize = 280;
  const cropW = aspect >= 1 ? cropSize : cropSize * aspect;
  const cropH = aspect >= 1 ? cropSize / aspect : cropSize;

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  // Clamp offset so image always covers the crop area
  const clampOffset = useCallback((ox: number, oy: number, z: number) => {
    if (!imgSize.w || !imgSize.h) return { x: 0, y: 0 };

    // Displayed image size at current zoom
    const scale = Math.max(cropW / imgSize.w, cropH / imgSize.h) * z;
    const dispW = imgSize.w * scale;
    const dispH = imgSize.h * scale;

    const maxX = Math.max(0, (dispW - cropW) / 2);
    const maxY = Math.max(0, (dispH - cropH) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }, [imgSize, cropW, cropH]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const clamped = clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, zoom);
    setOffset(clamped);
  }, [dragging, zoom, clampOffset]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleZoom = useCallback((newZoom: number) => {
    const z = Math.min(5, Math.max(1, newZoom));
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z));
  }, [clampOffset]);

  const handleConfirm = useCallback(async () => {
    if (!imgSize.w || !imgSize.h) return;

    const canvas = document.createElement("canvas");
    // Output resolution: match crop aspect at a good quality
    const outputW = aspect >= 1 ? 800 : Math.round(800 * aspect);
    const outputH = aspect >= 1 ? Math.round(800 / aspect) : 800;
    canvas.width = outputW;
    canvas.height = outputH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate which part of the source image is in the crop area
    const baseScale = Math.max(cropW / imgSize.w, cropH / imgSize.h);
    const scale = baseScale * zoom;
    const dispW = imgSize.w * scale;
    const dispH = imgSize.h * scale;

    // Center of displayed image relative to crop area center
    const centerX = dispW / 2 + offset.x;
    const centerY = dispH / 2 + offset.y;

    // Crop area in displayed image coordinates (top-left origin)
    const cropLeft = centerX - cropW / 2;
    const cropTop = centerY - cropH / 2;

    // Convert back to source image coordinates
    const srcX = cropLeft / scale;
    const srcY = cropTop / scale;
    const srcW = cropW / scale;
    const srcH = cropH / scale;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // If round shape, clip to circle
      if (shape === "round") {
        ctx.beginPath();
        ctx.arc(outputW / 2, outputH / 2, outputW / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);

      canvas.toBlob((blob) => {
        if (blob) onConfirm(blob);
      }, "image/jpeg", 0.9);
    };
    img.src = imageSrc;
  }, [imgSize, zoom, offset, cropW, cropH, aspect, shape, imageSrc, onConfirm]);

  // Image display style
  const baseScale = imgSize.w && imgSize.h ? Math.max(cropW / imgSize.w, cropH / imgSize.h) : 1;
  const scale = baseScale * zoom;
  const dispW = imgSize.w * scale;
  const dispH = imgSize.h * scale;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-bg-card border border-border rounded-2xl p-5 space-y-4 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Ajustar imagem</h3>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-black"
            style={{
              width: cropW,
              height: cropH,
              borderRadius: shape === "round" ? "50%" : "12px",
              cursor: dragging ? "grabbing" : "grab",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt=""
              draggable={false}
              className="select-none"
              style={{
                position: "absolute",
                width: dispW,
                height: dispH,
                left: `calc(50% - ${dispW / 2}px + ${offset.x}px)`,
                top: `calc(50% - ${dispH / 2}px + ${offset.y}px)`,
              }}
            />
          </div>
        </div>

        {/* Zoom control */}
        <div className="flex items-center gap-3 px-2">
          <button type="button" onClick={() => handleZoom(zoom - 0.2)} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={(e) => handleZoom(parseFloat(e.target.value))}
            className="flex-1 accent-accent-green h-1"
          />
          <button type="button" onClick={() => handleZoom(zoom + 0.2)} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-xs font-medium hover:bg-bg-card-hover transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep text-xs font-bold hover:shadow-[0_0_20px_rgba(3,255,148,0.2)] transition-all flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
