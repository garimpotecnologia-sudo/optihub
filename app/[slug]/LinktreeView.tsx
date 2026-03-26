"use client";

interface Button {
  label: string;
  url: string;
}

interface Linktree {
  title: string | null;
  bio: string | null;
  cover_image: string | null;
  logo: string | null;
  cover_position: string | null;
  logo_position: string | null;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  buttons: Button[];
}

export default function LinktreeView({ linktree }: { linktree: Linktree }) {
  const { title, bio, cover_image, logo, cover_position, logo_position, primary_color, secondary_color, text_color, buttons } = linktree;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: secondary_color }}>
      {/* Cover + Logo */}
      {cover_image ? (
        <div className="relative">
          <div className="h-48 sm:h-56 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover_image} alt="" className="w-full h-full object-cover" style={{ objectPosition: cover_position || "50% 50%" }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${secondary_color})` }} />
          </div>
          {logo && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10">
              <div className="w-24 h-24 rounded-full border-4 overflow-hidden shadow-lg" style={{ borderColor: primary_color }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="w-full h-full object-cover" style={{ objectPosition: logo_position || "50% 50%" }} />
              </div>
            </div>
          )}
        </div>
      ) : logo ? (
        <div className="pt-12 flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 overflow-hidden shadow-lg" style={{ borderColor: primary_color }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className="w-full h-full object-cover" style={{ objectPosition: logo_position || "50% 50%" }} />
          </div>
        </div>
      ) : null}

      {/* Content */}
      <div className={`flex-1 flex flex-col items-center px-6 pb-12 ${cover_image && logo ? "mt-14" : cover_image ? "mt-4" : logo ? "mt-4" : "pt-12"}`}>

        {/* Title & Bio */}
        {title && (
          <h1 className="text-xl font-bold text-center mb-1" style={{ color: text_color, fontFamily: "var(--font-heading, system-ui)" }}>
            {title}
          </h1>
        )}
        {bio && (
          <p className="text-sm text-center mb-8 max-w-sm opacity-70" style={{ color: text_color }}>
            {bio}
          </p>
        )}

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3">
          {(buttons || []).map((btn, i) => (
            <a
              key={i}
              href={btn.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 px-6 rounded-xl text-center font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{
                backgroundColor: primary_color,
                color: secondary_color,
              }}
            >
              {btn.label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12">
          <a href="https://hub.agentproia.com" target="_blank" rel="noopener noreferrer"
            className="text-xs opacity-30 hover:opacity-50 transition-opacity" style={{ color: text_color }}>
            Powered by ÓptiHub
          </a>
        </div>
      </div>
    </div>
  );
}
