"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";

interface ImagePositionModalProps {
  imageSrc: string;
  aspect: number;
  shape: "rect" | "round";
  initialPosition?: string;
  onConfirm: (position: string) => void;
  onCancel: () => void;
}

export function parsePosition(pos: string): { x: number; y: number; zoom: number } {
  const parts = pos.split(" ").map((p) => parseFloat(p));
  return { x: parts[0] ?? 50, y: parts[1] ?? 50, zoom: parts[2] || 1 };
}

export default function ImageCropModal({ imageSrc, aspect, shape, initialPosition, onConfirm, onCancel }: ImagePositionModalProps) {
  const parsed = parsePosition(initialPosition || "50% 50% 1");
  const [zoom, setZoom] = useState(parsed.zoom);
  const [pos, setPos] = useState({ x: parsed.x, y: parsed.y });
  const [dragging, setDragging] = useState(false);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const dragStart = useRef({ x: 0, y: 0, posX: 50, posY: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport size in the modal
  const viewportSize = 280;
  const viewportW = aspect >= 1 ? viewportSize : viewportSize * aspect;
  const viewportH = aspect >= 1 ? viewportSize / aspect : viewportSize;

  // Load image natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  // The image is displayed with object-fit: cover + scale(zoom)
  // object-position controls which part is visible
  // Dragging changes the object-position percentages

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !imgNatural.w || !imgNatural.h) return;
    e.preventDefault();

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Calculate how much overflow exists at current zoom
    // object-cover scale: image fills the viewport
    const coverScale = Math.max(viewportW / imgNatural.w, viewportH / imgNatural.h) * zoom;
    const overflowX = imgNatural.w * coverScale - viewportW;
    const overflowY = imgNatural.h * coverScale - viewportH;

    // Convert pixel drag to position percentage change
    // Drag right → image moves right → show more of the left side → decrease X%
    const deltaX = overflowX > 1 ? -(dx / overflowX) * 100 : 0;
    const deltaY = overflowY > 1 ? -(dy / overflowY) * 100 : 0;

    setPos({
      x: Math.min(100, Math.max(0, dragStart.current.posX + deltaX)),
      y: Math.min(100, Math.max(0, dragStart.current.posY + deltaY)),
    });
  }, [dragging, imgNatural, viewportW, viewportH, zoom]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleZoom = useCallback((newZoom: number) => {
    setZoom(Math.min(3, Math.max(1, newZoom)));
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(`${pos.x.toFixed(1)}% ${pos.y.toFixed(1)}% ${zoom.toFixed(2)}`);
  }, [pos, zoom, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-bg-card border border-border rounded-2xl p-5 space-y-4 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Ajustar posição</h3>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-black"
            style={{
              width: viewportW,
              height: viewportH,
              borderRadius: shape === "round" ? "50%" : "12px",
              cursor: dragging ? "grabbing" : "grab",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="w-full h-full object-cover select-none"
              style={{
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
              }}
            />
          </div>
        </div>

        <p className="text-[10px] text-text-muted text-center">Arraste para reposicionar</p>

        {/* Zoom control */}
        <div className="flex items-center gap-3 px-2">
          <button type="button" onClick={() => handleZoom(zoom - 0.15)} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => handleZoom(parseFloat(e.target.value))}
            className="flex-1 accent-accent-green h-1"
          />
          <button type="button" onClick={() => handleZoom(zoom + 0.15)} className="p-1 rounded-lg hover:bg-bg-card-hover text-text-muted">
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
