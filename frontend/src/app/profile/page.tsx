"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Medal, Trophy } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getMyAthleteProfile } from "@/lib/api";
import type { AthleteMe, AuthUser } from "@/lib/api";
import { formatDate } from "@/lib/time";
import AppShell from "@/components/AppShell";
import Card, { CardLabel } from "@/components/ui/Card";

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
  const [user, setUser] = useState<AuthUser | null>(null);
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
    setUser(session.user);

    getMyAthleteProfile(session.token)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  if (loading) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-foreground/60">Memuat profil...</p>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-red-600">{error || "Profil tidak ditemukan"}</p>
      </AppShell>
    );
  }

  const gold = profile.eventEntries.filter((e) => e.result === "GOLD").length;
  const silver = profile.eventEntries.filter((e) => e.result === "SILVER").length;
  const bronze = profile.eventEntries.filter((e) => e.result === "BRONZE").length;
  const totalCompetition = profile.eventEntries.length;

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>

          <Card className="mt-4">
            <div className="flex items-center gap-4">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.user.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-2xl font-bold text-white ring-4 ring-primary/10">
                  {initials(profile.user.name)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.user.name}</h2>
                <p className="text-sm text-foreground/55">{profile.user.email}</p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-black/5 pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-foreground/45">Nomor Atlet</dt>
                <dd className="text-sm font-medium text-foreground">
                  {profile.athleteNumber || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground/45">KTA</dt>
                <dd className="text-sm font-medium text-foreground">{profile.kta || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-foreground/45">Tanggal Lahir</dt>
                <dd className="text-sm font-medium text-foreground">
                  {profile.birthDate ? formatDate(profile.birthDate) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground/45">Kategori</dt>
                <dd className="text-sm font-medium text-foreground">
                  {profile.category ? CATEGORY_LABEL[profile.category] : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-foreground/45">Club</dt>
                <dd className="text-sm font-medium text-foreground">{profile.club || "-"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="mt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy size={16} />
              </div>
              <CardLabel>Statistik Atlet</CardLabel>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-background p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalCompetition}</p>
                <p className="mt-1 text-xs text-foreground/55">Total Competition</p>
              </div>
              <div className="rounded-xl bg-gold/10 p-4 text-center">
                <Medal size={18} className="mx-auto text-gold" />
                <p className="mt-1 text-2xl font-bold text-foreground">{gold}</p>
                <p className="mt-0.5 text-xs text-foreground/55">Gold</p>
              </div>
              <div className="rounded-xl bg-silver/10 p-4 text-center">
                <Medal size={18} className="mx-auto text-slate-400" />
                <p className="mt-1 text-2xl font-bold text-foreground">{silver}</p>
                <p className="mt-0.5 text-xs text-foreground/55">Silver</p>
              </div>
              <div className="rounded-xl bg-bronze/10 p-4 text-center">
                <Medal size={18} className="mx-auto text-bronze" />
                <p className="mt-1 text-2xl font-bold text-foreground">{bronze}</p>
                <p className="mt-0.5 text-xs text-foreground/55">Bronze</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
