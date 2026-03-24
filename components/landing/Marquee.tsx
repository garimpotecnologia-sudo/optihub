export default function Marquee() {
  const items = [
    "Criador de Artes",
    "Try-On Virtual",
    "Editor de Produtos",
    "Assistente de Vendas",
    "Templates Prontos",
    "Comunidade",
    "Remoção de Fundo",
    "Geração de Cenários",
    "Catálogos Digitais",
    "Posts para Instagram",
  ];

  return (
    <div className="relative py-5 overflow-hidden border-y border-border/50 bg-bg-elevated/30 backdrop-blur-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-medium text-text-muted/70 flex items-center gap-3 tracking-wide"
          >
            <span className="w-1 h-1 rounded-full bg-accent-green/30" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
