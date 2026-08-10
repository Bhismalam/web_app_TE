"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ChevronLeft, ChevronRight, Waves } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listTraining, createTrainingSession } from "@/lib/api";
import type { AuthUser, TrainingSession } from "@/lib/api";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday = 0 ... Sunday = 6
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export default function TrainingCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user);
    setToken(session.token);
  }, [router]);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const from = useMemo(() => toDateKey(new Date(year, month, 1)), [year, month]);
  const to = useMemo(() => toDateKey(new Date(year, month + 1, 0)), [year, month]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listTraining(token, from, to)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat jadwal"))
      .finally(() => setLoading(false));
  }, [token, from, to]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainingSession[]>();
    for (const session of sessions) {
      const key = toDateKey(new Date(session.date));
      map.set(key, [...(map.get(key) || []), session]);
    }
    return map;
  }, [sessions]);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayKey = toDateKey(new Date());

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setFormError("");
    setSubmitting(true);

    try {
      const created = await createTrainingSession(token, {
        title,
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        description: description || undefined,
      });
      setSessions((prev) => [...prev, created]);
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Training Calendar"
            description="Jadwal latihan bulanan untuk atlet."
            action={
              (user.role === "COACH" || user.role === "ADMIN") && (
                <Button
                  variant={showForm ? "outline" : "primary"}
                  icon={showForm ? <X size={16} /> : <Plus size={16} />}
                  onClick={() => setShowForm((v) => !v)}
                >
                  {showForm ? "Batal" : "Buat Jadwal"}
                </Button>
              )
            }
          />

          {showForm && (
            <Card className="mt-4">
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Judul Latihan
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sprint Training"
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
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
                      Mulai
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Selesai
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Deskripsi
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <Button type="submit" disabled={submitting} className="mt-1">
                  {submitting ? "Menyimpan..." : "Simpan Jadwal"}
                </Button>
              </form>
            </Card>
          )}

          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMonthDate(new Date(year, month - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-foreground/60 hover:bg-black/5"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-lg font-semibold text-foreground">
                {MONTH_LABELS[month]} {year}
              </h2>
              <button
                onClick={() => setMonthDate(new Date(year, month + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-foreground/60 hover:bg-black/5"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {loading && <p className="mt-4 text-sm text-foreground/60">Memuat jadwal...</p>}

            {!loading && !error && (
              <div className="mt-4 grid grid-cols-7 gap-1 text-xs">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="pb-1 text-center font-semibold text-foreground/45">
                    {label}
                  </div>
                ))}
                {cells.map((cellDate, idx) => {
                  if (!cellDate) return <div key={idx} />;
                  const key = toDateKey(cellDate);
                  const daySessions = sessionsByDate.get(key) || [];
                  const isToday = key === todayKey;
                  return (
                    <div
                      key={key}
                      className={`min-h-20 rounded-xl border p-1 ${
                        isToday ? "border-primary bg-primary/5" : "border-black/5"
                      }`}
                    >
                      <p
                        className={`text-right text-xs ${
                          isToday ? "font-bold text-primary" : "text-foreground/50"
                        }`}
                      >
                        {cellDate.getDate()}
                      </p>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {daySessions.map((session) => (
                          <p
                            key={session.id}
                            className="flex items-center gap-1 truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary"
                            title={session.title}
                          >
                            <Waves size={9} className="shrink-0" />
                            {session.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
