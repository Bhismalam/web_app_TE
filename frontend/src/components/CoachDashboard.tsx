"use client";

import { useEffect, useState } from "react";
import { getCoachDashboard } from "@/lib/api";
import type { CoachDashboardStats } from "@/lib/api";

export default function CoachDashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<CoachDashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoachDashboard(token)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="mt-8 text-sm text-foreground/60">Memuat dashboard...</p>;
  }

  if (error) {
    return <p className="mt-8 text-sm text-red-600">{error}</p>;
  }

  if (!stats) return null;

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-foreground/50">Total Athlete</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.totalAthletes}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-foreground/50">Active Training</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.activeTraining}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-foreground/50">Average Improvement</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {stats.averageImprovement !== null
              ? `${stats.averageImprovement >= 0 ? "+" : ""}${stats.averageImprovement.toFixed(1)}%`
              : "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-foreground/50">Need Attention</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.needAttention.length} Athlete</p>
        </div>
      </div>

      {stats.needAttention.length > 0 && (
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground/60">Perlu Perhatian</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {stats.needAttention.map((athlete) => (
              <li key={athlete.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{athlete.name}</span>
                <span className="text-foreground/60">{athlete.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
