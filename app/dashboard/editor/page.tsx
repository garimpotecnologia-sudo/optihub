"use client";

import { useState, useCallback } from "react";

const actions = [
  {
    id: "remove-bg",
    label: "Remover Fundo",
    icon: "🪄",
    prompt: "Remove the background from this product image, make it transparent/white",
  },
  {
    id: "lighting",
    label: "Ajustar Iluminação",
    icon: "💡",
    prompt: "Improve the lighting of this product photo, make it look professionally lit",
  },
  {
    id: "lifestyle",
    label: "Cenário Lifestyle",
    icon: "🏠",
    prompt: "Place this eyewear product in a lifestyle scene, modern and elegant setting",
  },
  {
    id: "vitrine",
    label: "Cenário Vitrine",
    icon: "🪟",
    prompt: "Place this eyewear product in a premium store display/vitrine setting",
  },
  {
    id: "studio",
    label: "Cenário Estúdio",
    icon: "📸",
    prompt: "Place this eyewear product on a clean studio background with professional lighting",
  },
  {
    id: "variations",
    label: "Gerar Variações",
    icon: "🔄",
    prompt: "Generate creative variations of this eyewear product photo",
  },
];

export default function EditorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...fileArray]);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleProcess = async () => {
    if (!files.length || !selectedAction) return;
    setLoading(true);
    const action = actions.find((a) => a.id === selectedAction);

    try {
      // Convert first file to base64
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: action?.prompt || "",
            referenceImages: [base64],
            tool: "EDITOR",
          }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setResults((prev) => [data.imageUrl, ...prev]);
        }
        setLoading(false);
      };
    } catch (err) {
      console.error("Erro ao processar:", err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Editor de Produtos
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Edite fotos dos seus produtos com IA. Remova fundos, mude cenários e
          mais.
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-[16px] border border-border bg-bg-card p-6">
        <div
          className="border-2 border-dashed border-border rounded-[12px] p-8 text-center hover:border-accent-green/30 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*";
            input.onchange = (e) =>
              handleFiles((e.target as HTMLInputElement).files);
            input.click();
          }}
        >
          <div className="text-4xl mb-3 opacity-30">📸</div>
          <p className="text-sm text-text-secondary mb-1">
            Arraste fotos aqui ou clique para upload
          </p>
          <p className="text-xs text-text-muted">
            PNG, JPG, WebP — até 10 imagens por vez
          </p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-[10px] overflow-hidden border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFiles((prev) => prev.filter((_, idx) => idx !== i));
                    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-bg-deep/80 flex items-center justify-center text-xs text-text-muted hover:text-accent-rose"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {previews.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">
            O que deseja fazer?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className={`p-4 rounded-[12px] border text-left transition-all ${
                  selectedAction === action.id
                    ? "border-accent-green/40 bg-accent-green/5"
                    : "border-border bg-bg-card hover:bg-bg-card-hover"
                }`}
              >
                <span className="text-2xl block mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || !selectedAction}
            className="mt-6 px-8 py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_20px_rgba(3,255,148,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? "Processando..." : "Processar"}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((url, i) => (
              <div
                key={i}
                className="rounded-[16px] border border-border bg-bg-card overflow-hidden"
              >
                <div className="aspect-square bg-bg-card-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Resultado ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <button className="w-full py-2 rounded-[8px] text-xs font-medium bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
