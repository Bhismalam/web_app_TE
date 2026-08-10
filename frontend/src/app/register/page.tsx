"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Waves, Medal } from "lucide-react";
import { registerAthlete, SPORT_LABEL } from "@/lib/api";
import type { Sport } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import Button from "@/components/ui/Button";

const SPORT_OPTIONS: Sport[] = ["SWIMMING", "FINSWIMMING"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sport, setSport] = useState<Sport>("FINSWIMMING");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await registerAthlete({ name, email, password, sport });
      saveSession(token, user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <div className="bg-dot-grid absolute inset-0 opacity-40" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Waves size={22} />
          </div>
          <span className="text-lg font-bold">SwimClub</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-4xl font-bold leading-tight">
            Mulai perjalanan atletmu bersama SwimClub.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-white/75">
            Daftar sebagai atlet, lalu langsung tracking time trial, jadwal latihan, dan
            pencapaianmu.
          </p>
          <div className="mt-10 flex items-center gap-2 text-sm text-white/85">
            <Medal size={18} /> Trophy Room untuk tiap pencapaian
          </div>
        </div>

        <p className="relative text-xs text-white/50">© 2026 SwimClub Management System</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Waves size={20} />
            </div>
            <span className="text-lg font-bold text-foreground">SwimClub</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Daftar Atlet</h2>
          <p className="mt-1 text-sm text-foreground/60">Buat akun untuk mulai tracking performa</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Nama Lengkap
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35"
                />
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35"
                  />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Konfirmasi
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35"
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="sport" className="mb-1.5 block text-sm font-medium text-foreground">
                Cabang
              </label>
              <select
                id="sport"
                value={sport}
                onChange={(e) => setSport(e.target.value as Sport)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {SPORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {SPORT_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
