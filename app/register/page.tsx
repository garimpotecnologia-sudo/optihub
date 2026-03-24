"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    opticaName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          optica_name: formData.opticaName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Update profile with optica name
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        optica_name: formData.opticaName,
      }).eq("id", user.id);
    }

    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-teal/5 blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-teal to-accent-green flex items-center justify-center">
            <span className="text-bg-deep font-bold text-lg font-[var(--font-heading)]">O</span>
          </div>
          <span className="text-2xl font-bold font-[var(--font-heading)]">
            Ópti<span className="text-accent-green">Hub</span>
          </span>
        </Link>

        <div className="rounded-[16px] border border-border bg-bg-card p-8">
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-center mb-2">
            Crie sua conta
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Comece grátis com 30 gerações por mês
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-[10px] bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[10px] border border-border hover:border-border-hover bg-bg-card-hover text-sm font-medium transition-all mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Cadastrar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-bg-card text-text-muted">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Seu nome</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="João Silva" required className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome da Ótica</label>
              <input type="text" name="opticaName" value={formData.opticaName} onChange={handleChange} placeholder="Ótica Visão Premium" className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" required className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Senha</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full px-4 py-3 rounded-[10px] bg-bg-deep border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 transition-all text-sm" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-[10px] bg-gradient-to-r from-accent-green to-accent-teal text-bg-deep font-bold text-sm hover:shadow-[0_0_20px_rgba(3,255,148,0.3)] transition-all disabled:opacity-50">
              {loading ? "Criando conta..." : "Criar Conta Grátis"}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-4">
            Ao criar conta, você concorda com os{" "}
            <a href="#" className="text-accent-green hover:underline">Termos de Uso</a> e{" "}
            <a href="#" className="text-accent-green hover:underline">Política de Privacidade</a>
          </p>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent-green hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
