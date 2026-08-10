"use client";

import { useEffect, useState } from "react";
import { getMyAthleteProfile, getTodayTraining } from "@/lib/api";
import type { AthleteMe, TrainingSession, AuthUser } from "@/lib/api";
import { parseTimeToSeconds, formatDate } from "@/lib/time";

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
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground/60">Next Competition</h2>
        {upcomingEntry ? (
          <div className="mt-2">
            <p className="text-lg font-bold text-foreground">🏆 {upcomingEntry.event.name}</p>
            <p className="mt-1 text-sm text-foreground/70">
              Tanggal: {formatDate(upcomingEntry.event.date)}
            </p>
            <p className="text-sm text-foreground/70">
              Kategori: {upcomingEntry.event.categories.join(", ")}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-foreground/60">Belum ada event mendatang.</p>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground/60">Your Performance</h2>
        {lastTrial ? (
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground">{lastTrial.category}</p>
            <div className="mt-2 flex gap-6">
              <div>
                <p className="text-xs text-foreground/50">Last Time</p>
                <p className="text-xl font-bold text-primary">{lastTrial.time}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Best Time</p>
                <p className="text-xl font-bold text-foreground">{bestTrial?.time}</p>
              </div>
            </div>
            {progressPercent !== null && (
              <p
                className={`mt-2 text-sm font-medium ${
                  progressPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {progressPercent >= 0 ? "↑" : "↓"} {Math.abs(progressPercent).toFixed(1)}%
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-foreground/60">Belum ada catatan time trial.</p>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:col-span-2">
        <h2 className="text-sm font-semibold text-foreground/60">Today&apos;s Training</h2>
        {training.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-2">
            {training.map((session) => (
              <li key={session.id} className="text-sm text-foreground">
                🏊 {session.title}
                {session.startTime && session.endTime && (
                  <span className="text-foreground/60">
                    {" "}
                    — {session.startTime} - {session.endTime}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-foreground/60">Tidak ada latihan hari ini.</p>
        )}
      </div>
    </div>
  );
}
