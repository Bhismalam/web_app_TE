"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  listAthletes,
  getTimeTrialsByAthlete,
  createTimeTrial,
  SPORT_LABEL,
} from "@/lib/api";
import type { AthleteSummary, TimeTrial, Sport, AuthUser } from "@/lib/api";
import { formatDate } from "@/lib/time";
import StarRatingInput from "@/components/StarRatingInput";
import StarRatingDisplay from "@/components/StarRatingDisplay";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Card, { CardLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PillGroup from "@/components/ui/PillGroup";

const SPORT_OPTIONS: Sport[] = ["SWIMMING", "FINSWIMMING"];

export default function TimeTrialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [sportFilter, setSportFilter] = useState<Sport | "ALL">("ALL");
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [trials, setTrials] = useState<TimeTrial[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [loadingTrials, setLoadingTrials] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("50M Surface");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [condition, setCondition] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [startRating, setStartRating] = useState(0);
  const [speedRating, setSpeedRating] = useState(0);
  const [techniqueRating, setTechniqueRating] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role !== "COACH" && session.user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setUser(session.user);
    setToken(session.token);

    listAthletes(session.token)
      .then((data) => {
        setAthletes(data);
        if (data.length > 0) setSelectedAthleteId(data[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat atlet"))
      .finally(() => setLoadingAthletes(false));
  }, [router]);

  useEffect(() => {
    if (!token || !selectedAthleteId) return;
    setLoadingTrials(true);
    getTimeTrialsByAthlete(token, selectedAthleteId)
      .then((data) => setTrials([...data].reverse()))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat time trial"))
      .finally(() => setLoadingTrials(false));
  }, [token, selectedAthleteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedAthleteId) return;
    setFormError("");
    setSubmitting(true);

    try {
      const created = await createTimeTrial(token, {
        athleteId: selectedAthleteId,
        category,
        date,
        time,
        condition: condition || undefined,
        coachNote: coachNote || undefined,
        startRating: startRating || undefined,
        speedRating: speedRating || undefined,
        techniqueRating: techniqueRating || undefined,
        recommendation: recommendation || undefined,
      });
      setTrials((prev) => [created, ...prev]);
      setDate("");
      setTime("");
      setCondition("");
      setCoachNote("");
      setStartRating(0);
      setSpeedRating(0);
      setTechniqueRating(0);
      setRecommendation("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan time trial");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredAthletes = athletes.filter(
    (a) => sportFilter === "ALL" || a.sport === sportFilter
  );

  useEffect(() => {
    if (filteredAthletes.length === 0) {
      setSelectedAthleteId("");
      return;
    }
    if (!filteredAthletes.some((a) => a.id === selectedAthleteId)) {
      setSelectedAthleteId(filteredAthletes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportFilter, athletes]);

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader title="Time Trial" description="Input hasil dan evaluasi time trial atlet." />

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {!loadingAthletes && athletes.length === 0 && (
            <div className="mt-6">
              <EmptyState icon={Timer} title="Belum ada atlet terdaftar" />
            </div>
          )}

          {athletes.length > 0 && (
            <>
              <div className="mt-4">
                <PillGroup
                  options={["ALL", ...SPORT_OPTIONS] as const}
                  value={sportFilter}
                  onChange={setSportFilter}
                  labelFor={(s) => (s === "ALL" ? "Semua" : SPORT_LABEL[s as Sport])}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Nama Atlet
                </label>
                {filteredAthletes.length === 0 ? (
                  <p className="text-sm text-foreground/55">Tidak ada atlet untuk filter ini.</p>
                ) : (
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {filteredAthletes.map((athlete) => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.user.name} ({SPORT_LABEL[athlete.sport]})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {filteredAthletes.length > 0 && (
                <Card className="mt-4">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Kategori
                        </label>
                        <input
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Tanggal
                        </label>
                        <input
                          required
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                          Time (mm:ss.ms)
                        </label>
                        <input
                          required
                          placeholder="00:23.40"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Kondisi
                      </label>
                      <input
                        placeholder="Pool 25M"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Catatan Coach
                      </label>
                      <textarea
                        value={coachNote}
                        onChange={(e) => setCoachNote(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    <div className="grid gap-4 rounded-xl bg-background p-4 sm:grid-cols-3">
                      <StarRatingInput label="Start" value={startRating} onChange={setStartRating} />
                      <StarRatingInput label="Speed" value={speedRating} onChange={setSpeedRating} />
                      <StarRatingInput
                        label="Technique"
                        value={techniqueRating}
                        onChange={setTechniqueRating}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Recommendation
                      </label>
                      <textarea
                        placeholder="Fokus latihan: underwater kick, breathing control"
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                    <Button type="submit" disabled={submitting} className="mt-1">
                      {submitting ? "Menyimpan..." : "Simpan Time Trial"}
                    </Button>
                  </form>
                </Card>
              )}

              {filteredAthletes.length > 0 && (
                <Card className="mt-4">
                  <CardLabel>Riwayat Time Trial</CardLabel>
                  {loadingTrials ? (
                    <p className="mt-3 text-sm text-foreground/55">Memuat...</p>
                  ) : trials.length === 0 ? (
                    <div className="mt-3">
                      <EmptyState icon={Timer} title="Belum ada catatan" />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col divide-y divide-black/5">
                      {trials.map((trial) => (
                        <div key={trial.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {trial.category} — <span className="text-primary">{trial.time}</span>
                            </p>
                            <p className="text-xs text-foreground/50">{formatDate(trial.date)}</p>
                          </div>
                          {trial.condition && (
                            <p className="mt-1 text-xs text-foreground/55">
                              Kondisi: {trial.condition}
                            </p>
                          )}
                          {(trial.startRating || trial.speedRating || trial.techniqueRating) && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-foreground/45">Start</p>
                                <StarRatingDisplay value={trial.startRating} />
                              </div>
                              <div>
                                <p className="text-foreground/45">Speed</p>
                                <StarRatingDisplay value={trial.speedRating} />
                              </div>
                              <div>
                                <p className="text-foreground/45">Technique</p>
                                <StarRatingDisplay value={trial.techniqueRating} />
                              </div>
                            </div>
                          )}
                          {trial.recommendation && (
                            <p className="mt-2 rounded-lg bg-background px-2.5 py-1.5 text-xs text-foreground/70">
                              Rekomendasi: {trial.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
