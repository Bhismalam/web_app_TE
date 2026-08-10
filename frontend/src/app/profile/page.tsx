"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getMyAthleteProfile } from "@/lib/api";
import type { AthleteMe } from "@/lib/api";
import { formatDate } from "@/lib/time";

const CATEGORY_LABEL: Record<string, string> = {
  JUNIOR: "Junior",
  SENIOR: "Senior",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AthleteMe | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role !== "ATHLETE") {
      router.replace("/dashboard");
      return;
    }

    getMyAthleteProfile(session.token)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="mt-8 px-6 text-sm text-foreground/60">Memuat profil...</p>;
  }

  if (error || !profile) {
    return <p className="mt-8 px-6 text-sm text-red-600">{error || "Profil tidak ditemukan"}</p>;
  }

  const gold = profile.eventEntries.filter((e) => e.result === "GOLD").length;
  const silver = profile.eventEntries.filter((e) => e.result === "SILVER").length;
  const bronze = profile.eventEntries.filter((e) => e.result === "BRONZE").length;
  const totalCompetition = profile.eventEntries.length;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Kembali ke Dashboard
        </Link>

        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={profile.user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                {initials(profile.user.name)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.user.name}</h1>
              <p className="text-sm text-foreground/60">{profile.user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-foreground/50">Nomor Atlet</dt>
              <dd className="text-sm font-medium text-foreground">
                {profile.athleteNumber || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/50">KTA</dt>
              <dd className="text-sm font-medium text-foreground">{profile.kta || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/50">Tanggal Lahir</dt>
              <dd className="text-sm font-medium text-foreground">
                {profile.birthDate ? formatDate(profile.birthDate) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/50">Kategori</dt>
              <dd className="text-sm font-medium text-foreground">
                {profile.category ? CATEGORY_LABEL[profile.category] : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/50">Club</dt>
              <dd className="text-sm font-medium text-foreground">{profile.club || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground/60">Statistik Atlet</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-background p-4 text-center">
              <p className="text-2xl font-bold text-foreground">🏆 {totalCompetition}</p>
              <p className="mt-1 text-xs text-foreground/60">Total Competition</p>
            </div>
            <div className="rounded-xl bg-background p-4 text-center">
              <p className="text-2xl font-bold text-foreground">🥇 {gold}</p>
              <p className="mt-1 text-xs text-foreground/60">Gold</p>
            </div>
            <div className="rounded-xl bg-background p-4 text-center">
              <p className="text-2xl font-bold text-foreground">🥈 {silver}</p>
              <p className="mt-1 text-xs text-foreground/60">Silver</p>
            </div>
            <div className="rounded-xl bg-background p-4 text-center">
              <p className="text-2xl font-bold text-foreground">🥉 {bronze}</p>
              <p className="mt-1 text-xs text-foreground/60">Bronze</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
