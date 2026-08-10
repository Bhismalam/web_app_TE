"use client";

import { useEffect, useState } from "react";
import { Trophy, LineChart, Clock, TrendingUp, TrendingDown, Waves } from "lucide-react";
import { getMyAthleteProfile, getTodayTraining } from "@/lib/api";
import type { AthleteMe, TrainingSession, AuthUser } from "@/lib/api";
import { parseTimeToSeconds, formatDate, formatRupiah } from "@/lib/time";
import Card, { CardLabel } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

export default function AthleteDashboard({ user, token }: { user: AuthUser; token: string }) {
  const [profile, setProfile] = useState<AthleteMe | null>(null);
  const [training, setTraining] = useState<TrainingSession[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAthleteProfile(token), getTodayTraining(token)])
      .then(([athleteProfile, todayTraining]) => {
        setProfile(athleteProfile);
        setTraining(todayTraining);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="mt-8 text-sm text-foreground/60">Memuat dashboard...</p>;
  }

  if (error) {
    return <p className="mt-8 text-sm text-red-600">{error}</p>;
  }

  if (!profile) return null;

  const upcomingEntry = [...profile.eventEntries]
    .filter((entry) => new Date(entry.event.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime())[0];

  const trials = [...profile.timeTrials].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const lastTrial = trials[trials.length - 1];
  const bestTrial = trials.reduce<typeof trials[number] | null>((best, trial) => {
    if (!best) return trial;
    return parseTimeToSeconds(trial.time) < parseTimeToSeconds(best.time) ? trial : best;
  }, null);

  let progressPercent: number | null = null;
  if (trials.length > 1 && lastTrial) {
    const previousTrials = trials.slice(0, -1);
    const previousBest = previousTrials.reduce((best, trial) =>
      parseTimeToSeconds(trial.time) < parseTimeToSeconds(best.time) ? trial : best
    );
    const prevSec = parseTimeToSeconds(previousBest.time);
    const lastSec = parseTimeToSeconds(lastTrial.time);
    progressPercent = ((prevSec - lastSec) / prevSec) * 100;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Card>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Trophy size={16} />
          </div>
          <CardLabel>Next Competition</CardLabel>
        </div>
        {upcomingEntry ? (
          <div className="mt-3">
            <p className="text-lg font-bold text-foreground">{upcomingEntry.event.name}</p>
            <p className="mt-1 text-sm text-foreground/60">
              {formatDate(upcomingEntry.event.date)}
            </p>
            {upcomingEntry.categories && upcomingEntry.categories.length > 0 && (
              <>
                <p className="text-sm text-foreground/60">
                  Nomor:{" "}
                  {upcomingEntry.categories
                    .map((c) => c.category.name + (c.category.type === "ESTAFET" ? " (Estafet)" : ""))
                    .join(", ")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-foreground/50">
                    {formatRupiah(upcomingEntry.categories.reduce((s, c) => s + c.fee, 0))}
                  </span>
                  <Badge tone={upcomingEntry.paymentStatus === "PAID" ? "green" : "gold"}>
                    {upcomingEntry.paymentStatus === "PAID" ? "Sudah Bayar" : "Belum Bayar"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-foreground/50">Belum ada event mendatang.</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LineChart size={16} />
          </div>
          <CardLabel>Your Performance</CardLabel>
        </div>
        {lastTrial ? (
          <div className="mt-3">
            <p className="text-sm font-medium text-foreground">{lastTrial.category}</p>
            <div className="mt-2 flex gap-6">
              <div>
                <p className="text-xs text-foreground/45">Last Time</p>
                <p className="text-xl font-bold text-primary">{lastTrial.time}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/45">Best Time</p>
                <p className="text-xl font-bold text-foreground">{bestTrial?.time}</p>
              </div>
            </div>
            {progressPercent !== null && (
              <p
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  progressPercent >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {progressPercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(progressPercent).toFixed(1)}%
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/50">Belum ada catatan time trial.</p>
        )}
      </Card>

      <Card className="sm:col-span-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
            <Clock size={16} />
          </div>
          <CardLabel>Today&apos;s Training</CardLabel>
        </div>
        {training.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {training.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-3 rounded-xl bg-background px-3 py-2.5 text-sm"
              >
                <Waves size={16} className="shrink-0 text-primary" />
                <span className="font-medium text-foreground">{session.title}</span>
                {session.startTime && session.endTime && (
                  <span className="ml-auto text-foreground/50">
                    {session.startTime} - {session.endTime}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState icon={Clock} title="Tidak ada latihan hari ini" />
          </div>
        )}
      </Card>
    </div>
  );
}
