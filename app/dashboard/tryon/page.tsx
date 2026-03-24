"use client";

import { useState } from "react";

export default function TryOnPage() {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [frame, setFrame] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (
    setter: (v: string | null) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTryOn = async () => {
    if (!selfie || !frame) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Place these eyeglasses/sunglasses on the person's face in the selfie photo. Make it look natural and realistic, properly aligned with the face.",
          referenceImages: [selfie, frame],
          tool: "TRYON",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) setResult(data.imageUrl);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Try-On Virtual
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Experimente armações virtualmente. Envie uma selfie e veja como fica.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Selfie upload */}
        <div className="rounded-[16px] border border-border bg-bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Selfie do Cliente</h3>
          {selfie ? (
            <div className="relative aspect-square rounded-[12px] overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfie}
                alt="Selfie"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelfie(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-bg-deep/80 flex items-center justify-center text-text-muted hover:text-accent-rose"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-border rounded-[12px] p-12 text-center hover:border-accent-green/30 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center">
              <div className="text-4xl mb-3 opacity-30">🤳</div>
              <p className="text-sm text-text-secondary">Enviar selfie</p>
              <p className="text-xs text-text-muted mt-1">ou capturar pela câmera</p>
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => handleImageUpload(setSelfie, e)}
              />
            </label>
          )}
        </div>

        {/* Frame upload */}
        <div className="rounded-[16px] border border-border bg-bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Armação</h3>
          {frame ? (
            <div className="relative aspect-square rounded-[12px] overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frame}
                alt="Armação"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFrame(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-bg-deep/80 flex items-center justify-center text-text-muted hover:text-accent-rose"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-border rounded-[12px] p-12 text-center hover:border-accent-teal/30 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center">
              <div className="text-4xl mb-3 opacity-30">👓</div>
              <p className="text-sm text-text-secondary">Enviar armação</p>
              <p className="text-xs text-text-muted mt-1">ou escolher do catálogo</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(setFrame, e)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Generate button */}
      {selfie && frame && (
        <div className="flex justify-center">
          <button
            onClick={handleTryOn}
            disabled={loading}
            className="px-10 py-3.5 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_20px_rgba(3,255,148,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? "Processando Try-On..." : "Experimentar Armação"}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">
            Resultado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[16px] border border-border bg-bg-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <span className="text-xs font-medium text-text-muted">
                  Antes
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfie!}
                alt="Antes"
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="rounded-[16px] border border-accent-green/30 bg-bg-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <span className="text-xs font-medium text-accent-green">
                  Depois
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result}
                alt="Depois"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3 justify-center">
            <button className="px-6 py-2.5 rounded-[10px] bg-accent-green/10 text-accent-green text-sm font-medium hover:bg-accent-green/20 transition-colors">
              Download
            </button>
            <button className="px-6 py-2.5 rounded-[10px] border border-border text-text-secondary text-sm font-medium hover:border-accent-green/30 hover:text-accent-green transition-colors">
              Enviar via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
