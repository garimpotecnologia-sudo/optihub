import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-teal to-accent-green flex items-center justify-center">
                <span className="text-bg-deep font-[800] text-xs">O</span>
              </div>
              <span className="text-base font-[700] font-[var(--font-heading)] tracking-tight">
                Ópti<span className="text-accent-green">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Hub de inteligência artificial
              <br />
              para o mercado óptico brasileiro.
            </p>
          </div>

          {[
            {
              title: "Produto",
              links: ["Criador de Artes", "Try-On Virtual", "Editor", "Assistente"],
            },
            {
              title: "Empresa",
              links: ["Sobre", "Blog", "Contato", "Carreiras"],
            },
            {
              title: "Legal",
              links: ["Termos de Uso", "Privacidade", "LGPD"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-[600] mb-4 tracking-wide">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-text-muted hover:text-accent-green transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; 2025 ÓptiHub by AgentPRO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Powered by</span>
            <span className="text-xs font-bold text-accent-green tracking-wide">
              Nano Banana AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
