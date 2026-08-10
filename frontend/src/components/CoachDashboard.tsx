"use client";

import { useEffect, useState } from "react";
import { Users, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { getCoachDashboard } from "@/lib/api";
import type { CoachDashboardStats } from "@/lib/api";
import Card, { CardLabel } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

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
    <div className="mt-6 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Athlete" value={stats.totalAthletes} tone="primary" />
        <StatCard icon={Activity} label="Active Training" value={stats.activeTraining} tone="green" />
        <StatCard
          icon={TrendingUp}
          label="Average Improvement"
          value={
            stats.averageImprovement !== null
              ? `${stats.averageImprovement >= 0 ? "+" : ""}${stats.averageImprovement.toFixed(1)}%`
              : "-"
          }
          tone="gold"
        />
        <StatCard
          icon={AlertCircle}
          label="Need Attention"
          value={`${stats.needAttention.length} Athlete`}
          tone="bronze"
        />
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bronze/15 text-bronze">
            <AlertCircle size={16} />
          </div>
          <CardLabel>Perlu Perhatian</CardLabel>
        </div>
        {stats.needAttention.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {stats.needAttention.map((athlete) => (
              <li
                key={athlete.id}
                className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">{athlete.name}</span>
                <span className="text-foreground/55">{athlete.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState icon={Users} title="Semua atlet dalam kondisi baik" />
          </div>
        )}
      </Card>
    </div>
  );
}
