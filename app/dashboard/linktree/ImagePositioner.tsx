"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Move } from "lucide-react";

interface ImagePositionerProps {
  src: string;
  currentPosition: string;
  onPositionChange: (position: string) => void;
  shape: "circle" | "rect";
  className?: string;
}

function parsePosition(pos: string): [number, number] {
  const parts = pos.split(" ").map((p) => parseFloat(p));
  return [parts[0] ?? 50, parts[1] ?? 50];
}

export default function ImagePositioner({ src, currentPosition, onPositionChange, shape, className }: ImagePositionerProps) {
  const [repositioning, setRepositioning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number; posX: number; posY: number }>({ x: 0, y: 0, posX: 50, posY: 50 });
  const [pos, setPos] = useState<[number, number]>(() => parsePosition(currentPosition));

  useEffect(() => {
    setPos(parsePosition(currentPosition));
  }, [currentPosition]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!repositioning) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, posX: pos[0], posY: pos[1] };
  }, [repositioning, pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();

    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    if (!nw || !nh) return;

    // object-cover scale factor
    const scale = Math.max(cw / nw, ch / nh);
    const overflowX = nw * scale - cw;
    const overflowY = nh * scale - ch;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    // Convert pixel drag to percentage (inverted: drag right → show more left → decrease %)
    const newX = overflowX > 0 ? Math.min(100, Math.max(0, startRef.current.posX - (dx / overflowX) * 100)) : 50;
    const newY = overflowY > 0 ? Math.min(100, Math.max(0, startRef.current.posY - (dy / overflowY) * 100)) : 50;

    setPos([newX, newY]);
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    onPositionChange(`${pos[0].toFixed(1)}% ${pos[1].toFixed(1)}%`);
  }, [dragging, pos, onPositionChange]);

  const toggleReposition = useCallback(() => {
    if (repositioning) {
      setRepositioning(false);
      onPositionChange(`${pos[0].toFixed(1)}% ${pos[1].toFixed(1)}%`);
    } else {
      setRepositioning(true);
    }
  }, [repositioning, pos, onPositionChange]);

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className={`relative group ${className || ""}`}>
      <div
        ref={containerRef}
        className={`overflow-hidden ${shapeClass} ${repositioning ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
        style={{ width: "100%", height: "100%" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          className="w-full h-full object-cover select-none"
          style={{ objectPosition: `${pos[0]}% ${pos[1]}%` }}
          draggable={false}
        />
      </div>

      {/* Reposition toggle button */}
      <button
        type="button"
        onClick={toggleReposition}
        className={`absolute top-1 right-1 p-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all ${
          repositioning
            ? "bg-accent-green text-bg-deep shadow-md"
            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
        }`}
      >
        <Move className="w-3 h-3" />
        {repositioning ? "OK" : "Mover"}
      </button>

      {repositioning && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
          Arraste para reposicionar
        </div>
      )}
    </div>
  );
}
