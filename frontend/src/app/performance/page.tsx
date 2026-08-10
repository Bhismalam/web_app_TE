"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart as LineChartIcon } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getMyAthleteProfile } from "@/lib/api";
import type { AthleteMe, AuthUser } from "@/lib/api";
import PerformanceChart from "@/components/PerformanceChart";
import { parseTimeToSeconds } from "@/lib/time";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Card, { CardLabel } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function PerformancePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AthleteMe | null>(null);
  const [category, setCategory] = useState("");
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
      .then((data) => {
        setProfile(data);
        if (data.timeTrials.length > 0) setCategory(data.timeTrials[0].category);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [router]);

  const categories = useMemo(() => {
    if (!profile) return [];
    return Array.from(new Set(profile.timeTrials.map((t) => t.category)));
  }, [profile]);

  const trialsForCategory = useMemo(() => {
    if (!profile) return [];
    return profile.timeTrials.filter((t) => t.category === category);
  }, [profile, category]);

  const bestTime = useMemo(() => {
    if (trialsForCategory.length === 0) return null;
    return trialsForCategory.reduce((best, t) =>
      parseTimeToSeconds(t.time) < parseTimeToSeconds(best.time) ? t : best
    );
  }, [trialsForCategory]);

  if (!user) return null;

  if (loading) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-foreground/60">Memuat performa...</p>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-red-600">{error || "Data tidak ditemukan"}</p>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Performance Tracking"
            description="Apakah kamu berkembang? Lihat progres waktu per kategori."
          />

          {categories.length === 0 ? (
            <div className="mt-6">
              <EmptyState icon={LineChartIcon} title="Belum ada data time trial" description="Progres akan tampil setelah coach mencatat time trial pertamamu." />
            </div>
          ) : (
            <>
              {categories.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2 rounded-full bg-black/5 p-1">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        c === category
                          ? "bg-white text-primary shadow-soft"
                          : "text-foreground/55 hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <Card className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LineChartIcon size={16} />
                    </div>
                    <CardLabel>Progress Time — {category}</CardLabel>
                  </div>
                  {bestTime && (
                    <p className="text-sm text-foreground/60">
                      Best: <span className="font-bold text-primary">{bestTime.time}</span>
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <PerformanceChart trials={trialsForCategory} />
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
