"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";
import LinktreeView from "@/app/[slug]/LinktreeView";
import ImageCropModal, { parsePosition } from "./ImageCropModal";

interface Button {
  label: string;
  url: string;
}

export default function LinktreeEditorPage() {
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [logo, setLogo] = useState("");
  const [coverPosition, setCoverPosition] = useState("50% 50%");
  const [logoPosition, setLogoPosition] = useState("50% 50%");
  const [primaryColor, setPrimaryColor] = useState("#03FF94");
  const [secondaryColor, setSecondaryColor] = useState("#0C1A14");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [cropModal, setCropModal] = useState<{ src: string; type: "logo" | "cover" } | null>(null);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [viewsCount, setViewsCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLinktree, setHasLinktree] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/linktree");
      const data = await res.json();
      if (data.linktree) {
        const lt = data.linktree;
        setSlug(lt.slug);
        setTitle(lt.title || "");
        setBio(lt.bio || "");
        setCoverImage(lt.cover_image || "");
        setLogo(lt.logo || "");
        setCoverPosition(lt.cover_position || "50% 50%");
        setLogoPosition(lt.logo_position || "50% 50%");
        setPrimaryColor(lt.primary_color || "#03FF94");
        setSecondaryColor(lt.secondary_color || "#0C1A14");
        setTextColor(lt.text_color || "#FFFFFF");
        setButtons(lt.buttons || []);
        setIsPublished(lt.is_published);
        setViewsCount(lt.views_count || 0);
        setHasLinktree(true);
        setSlugAvailable(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  const checkSlug = useCallback(async (value: string) => {
    if (value.length < 3) { setSlugAvailable(null); return; }
    const res = await fetch(`/api/linktree/check-slug?slug=${value}`);
    const data = await res.json();
    setSlugAvailable(data.available || hasLinktree);
  }, [hasLinktree]);

  useEffect(() => {
    if (!slug || hasLinktree) return;
    const timeout = setTimeout(() => checkSlug(slug), 500);
    return () => clearTimeout(timeout);
  }, [slug, checkSlug, hasLinktree]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `linktree/${user.id}/${type}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("generations").upload(fileName, file, { upsert: true });
    if (error) return;

    const { data: urlData } = supabase.storage.from("generations").getPublicUrl(fileName);
    const url = urlData.publicUrl;

    if (type === "logo") { setLogo(url); setLogoPosition("50% 50%"); }
    else { setCoverImage(url); setCoverPosition("50% 50%"); }

    // Open position modal automatically after upload
    setCropModal({ src: url, type });
  };

  const handlePositionConfirm = (position: string) => {
    if (!cropModal) return;
    if (cropModal.type === "logo") setLogoPosition(position);
    else setCoverPosition(position);
    setCropModal(null);
  };

  const addButton = () => {
    if (buttons.length >= 10) return;
    setButtons([...buttons, { label: "", url: "" }]);
  };

  const updateButton = (index: number, field: "label" | "url", value: string) => {
    setButtons(buttons.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/linktree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug, title, bio, cover_image: coverImage, logo,
        cover_position: coverPosition, logo_position: logoPosition,
        primary_color: primaryColor, secondary_color: secondaryColor,
        text_color: textColor, buttons: buttons.filter((b) => b.label && b.url).map((b) => ({ ...b, url: /^https?:\/\//i.test(b.url) ? b.url : `https://${b.url}` })),
        is_published: isPublished,
      }),
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    else { setSaved(true); setHasLinktree(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://hub.agentproia.com/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewData = {
    title, bio, cover_image: coverImage, logo,
    cover_position: coverPosition, logo_position: logoPosition,
    primary_color: primaryColor, secondary_color: secondaryColor,
    text_color: textColor, buttons,
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto animate-pulse space-y-4"><div className="h-10 w-48 rounded-lg bg-bg-card-hover" /><div className="h-96 rounded-2xl bg-bg-card" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[700] font-[var(--font-heading)] tracking-tight">BioPRO</h1>
          <p className="text-text-secondary text-sm mt-1">Crie sua página de links para o Instagram.</p>
        </div>
        {hasLinktree && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">{viewsCount} visualizações</span>
            <button onClick={copyLink}
              className="btn-press px-4 py-2 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-bold hover:bg-accent-green/20 transition-colors">
              {copied ? "Copiado!" : "Copiar Link"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {/* Slug */}
          <div className="card-base rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Seu Link</label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-2.5 rounded-l-xl bg-bg-deep border border-r-0 border-border text-[11px] text-text-muted whitespace-nowrap">hub.agentproia.com/</span>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="sua-otica" className="input-glow flex-1 px-3 py-2.5 rounded-r-xl bg-bg-deep border border-border text-text-primary text-sm focus:outline-none" />
              </div>
              {slug.length >= 3 && slugAvailable !== null && (
                <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${slugAvailable ? "text-accent-green" : "text-accent-rose"}`}>
                  {slugAvailable ? "✓ Disponível" : "✕ Já em uso"}
                </p>
              )}
              {hasLinktree && slug && (
                <div className="flex items-center gap-0 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://hub.agentproia.com/${slug}`}
                    className="flex-1 px-3 py-2 rounded-l-lg bg-bg-deep border border-r-0 border-border text-text-primary text-[11px] focus:outline-none cursor-text select-all"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-3 py-2 rounded-r-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-[11px] font-semibold hover:bg-accent-green/20 transition-colors whitespace-nowrap"
                  >
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1.5">Título</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ótica do João" className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1.5">Bio</label>
                <input type="text" value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Sua descrição curta" className="input-glow w-full px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card-base rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Imagens</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-muted mb-1.5">Logo</label>
                {logo ? (
                  <div className="space-y-1.5">
                    <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" style={{ objectPosition: `${parsePosition(logoPosition).x}% ${parsePosition(logoPosition).y}%`, transform: parsePosition(logoPosition).zoom !== 1 ? `scale(${parsePosition(logoPosition).zoom})` : undefined, transformOrigin: `${parsePosition(logoPosition).x}% ${parsePosition(logoPosition).y}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCropModal({ src: logo, type: "logo" })} className="text-[10px] text-accent-green hover:underline">
                        Ajustar
                      </button>
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="text-[10px] text-text-muted hover:underline">
                        Trocar
                      </button>
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                  </div>
                ) : (
                  <label className="cursor-pointer group">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-accent-green/30 bg-bg-deep flex items-center justify-center overflow-hidden transition-all">
                      <svg className="w-6 h-6 text-text-muted group-hover:text-accent-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "logo")} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-[11px] text-text-muted mb-1.5">Foto da Loja</label>
                {coverImage ? (
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl border-2 border-border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" style={{ objectPosition: `${parsePosition(coverPosition).x}% ${parsePosition(coverPosition).y}%`, transform: parsePosition(coverPosition).zoom !== 1 ? `scale(${parsePosition(coverPosition).zoom})` : undefined, transformOrigin: `${parsePosition(coverPosition).x}% ${parsePosition(coverPosition).y}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCropModal({ src: coverImage, type: "cover" })} className="text-[10px] text-accent-green hover:underline">
                        Ajustar
                      </button>
                      <button type="button" onClick={() => coverInputRef.current?.click()} className="text-[10px] text-text-muted hover:underline">
                        Trocar
                      </button>
                    </div>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
                  </div>
                ) : (
                  <label className="cursor-pointer group">
                    <div className="h-20 rounded-xl border-2 border-dashed border-border hover:border-accent-green/30 bg-bg-deep flex items-center justify-center overflow-hidden transition-all">
                      <svg className="w-6 h-6 text-text-muted group-hover:text-accent-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" /></svg>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="card-base rounded-2xl p-5 space-y-3">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Cores</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Botões", value: primaryColor, set: setPrimaryColor },
                { label: "Fundo", value: secondaryColor, set: setSecondaryColor },
                { label: "Texto", value: textColor, set: setTextColor },
              ].map((c) => (
                <div key={c.label}>
                  <label className="block text-[10px] text-text-muted mb-1">{c.label}</label>
                  <div className="flex items-center gap-1.5">
                    <label className="relative cursor-pointer">
                      <input type="color" value={c.value} onChange={(e) => c.set(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-8 h-8 rounded-lg border-2 border-border" style={{ backgroundColor: c.value }} />
                    </label>
                    <input type="text" value={c.value} onChange={(e) => c.set(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-bg-deep border border-border text-text-primary text-[10px] font-mono focus:outline-none w-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="card-base rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Botões ({buttons.length}/10)</label>
              {buttons.length < 10 && (
                <button onClick={addButton} className="text-[11px] text-accent-green font-medium hover:underline">+ Adicionar</button>
              )}
            </div>
            {buttons.length === 0 && <p className="text-[10px] text-text-muted">Adicione botões para seu BioPRO.</p>}
            <div className="space-y-2">
              {buttons.map((btn, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] text-text-muted w-4 shrink-0">{i + 1}</span>
                  <input type="text" value={btn.label} onChange={(e) => updateButton(i, "label", e.target.value)}
                    placeholder="Nome do botão" className="input-glow flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none" />
                  <input type="text" value={btn.url} onChange={(e) => updateButton(i, "url", e.target.value)}
                    placeholder="https://..." className="input-glow flex-1 px-3 py-2 rounded-lg bg-bg-deep border border-border text-text-primary text-xs focus:outline-none" />
                  <button onClick={() => removeButton(i)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving || !slug || slug.length < 3}
              className="btn-press px-8 py-3 rounded-xl bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_30px_rgba(3,255,148,0.25)] transition-all disabled:opacity-40">
              {saving ? "Salvando..." : saved ? "Salvo!" : hasLinktree ? "Atualizar" : "Criar BioPRO"}
            </button>
            <button onClick={() => setIsPublished(!isPublished)}
              className={`px-4 py-3 rounded-xl text-xs font-medium border transition-all ${isPublished ? "border-accent-green/20 text-accent-green bg-accent-green/5" : "border-border text-text-muted"}`}>
              {isPublished ? "Publicado" : "Rascunho"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="hidden lg:block">
          <label className="block text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Preview</label>
          <div className="rounded-2xl overflow-hidden border border-border" style={{ height: "680px" }}>
            <div className="w-full h-full overflow-y-auto">
              <LinktreeView linktree={previewData} />
            </div>
          </div>
        </div>
      </div>

      {/* Position Modal */}
      {cropModal && (
        <ImageCropModal
          imageSrc={cropModal.src}
          aspect={cropModal.type === "cover" ? 16 / 9 : 1}
          shape={cropModal.type === "cover" ? "rect" : "round"}
          initialPosition={cropModal.type === "cover" ? coverPosition : logoPosition}
          onConfirm={handlePositionConfirm}
          onCancel={() => setCropModal(null)}
        />
      )}
    </div>
  );
}
