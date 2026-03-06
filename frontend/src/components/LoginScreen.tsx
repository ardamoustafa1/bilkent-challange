import { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<{ error?: string } | void>;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErr("Email gerekli.");
      return;
    }
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) {
      setErr("Geçerli bir email adresi girin.");
      return;
    }
    if (!pass) {
      setErr("Şifre gerekli.");
      return;
    }
    const result = await onLogin(trimmedEmail, pass);
    if (result?.error) setErr(result.error);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 md:flex-row">
      {/* Sol: Marka alanı */}
      <div className="flex flex-1 flex-col justify-between p-8 md:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AI Challenge</span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
            Hakem & Yönetim Paneli
          </h1>
          <p className="mt-4 max-w-md text-lg text-slate-400">
            Takımları değerlendirin, skorları girin ve turnuva akışını tek yerden yönetin.
          </p>
        </div>
        <div className="hidden text-slate-500 md:block">
          <p className="text-sm">Demo: admin@biltek.k12.tr / hakem@biltek.k12.tr / misafir@biltek.k12.tr</p>
          <p className="mt-1 text-sm">Şifre: Biltek2026!</p>
        </div>
      </div>

      {/* Sağ: Giriş formu */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 shadow-2xl md:rounded-l-3xl md:shadow-none">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-900">Giriş yap</h2>
          <p className="mt-1 text-sm text-slate-500">Hesabınızla devam edin</p>
          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div>
              <Label className="text-sm font-medium text-slate-700" htmlFor="login-email">
                Email
              </Label>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-label="Email"
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@biltek.k12.tr"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700" htmlFor="login-password">
                Şifre
              </Label>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Lock className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="Şifre"
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            {err ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            ) : null}
            <Button type="submit" className="w-full rounded-xl py-3 text-base font-semibold shadow-md">
              Giriş Yap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 md:hidden">
            <p>Demo: admin@biltek.k12.tr / hakem@biltek.k12.tr</p>
            <p className="mt-1">Şifre: Biltek2026!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
