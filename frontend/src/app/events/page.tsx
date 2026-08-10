"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X, Trash2, Trophy, MapPin, Calendar, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listEvents, createEvent, EVENT_CATEGORY_TYPE_LABEL, SPORT_LABEL } from "@/lib/api";
import type { AuthUser, EventSummary, EventCategoryType, Sport } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/time";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

const CATEGORY_TYPES: EventCategoryType[] = ["INDIVIDU", "ESTAFET"];
const SPORT_OPTIONS: Sport[] = ["SWIMMING", "FINSWIMMING"];

const SPORT_BADGE_CLASS: Record<Sport, string> = {
  SWIMMING: "bg-primary/10 text-primary",
  FINSWIMMING: "bg-secondary/15 text-secondary",
};

const CUSTOM_OPTION = "__CUSTOM__";

const NOMOR_OPTIONS: Record<Sport, string[]> = {
  SWIMMING: [
    "50M Gaya Bebas",
    "100M Gaya Bebas",
    "200M Gaya Bebas",
    "400M Gaya Bebas",
    "50M Gaya Punggung",
    "100M Gaya Punggung",
    "200M Gaya Punggung",
    "50M Gaya Dada",
    "100M Gaya Dada",
    "200M Gaya Dada",
    "50M Gaya Kupu-kupu",
    "100M Gaya Kupu-kupu",
    "200M Gaya Kupu-kupu",
    "200M Gaya Ganti Perorangan",
    "400M Gaya Ganti Perorangan",
    "4x50M Estafet Bebas",
    "4x100M Estafet Bebas",
    "4x100M Estafet Ganti",
  ],
  FINSWIMMING: [
    "50M Surface",
    "100M Surface",
    "200M Surface",
    "400M Surface",
    "4x50M Estafet Surface",
    "4x100M Estafet Surface",
    "50M Bifins",
    "100M Bifins",
    "200M Bifins",
    "400M Bifins",
    "50M Apnea",
    "100M Apnea",
    "100M Immersion",
    "400M Immersion",
  ],
};

type CategoryRow = { name: string; type: EventCategoryType; fee: string; custom: boolean };

const EMPTY_ROW: CategoryRow = { name: "", type: "INDIVIDU", fee: "", custom: false };

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState<Sport>("FINSWIMMING");
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([{ ...EMPTY_ROW }]);
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

    listEvents(session.token)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat event"))
      .finally(() => setLoading(false));
  }, [router]);

  function updateRow(index: number, field: "name" | "type" | "fee", value: string) {
    setCategoryRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function updateRowNomor(index: number, value: string) {
    setCategoryRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (value === CUSTOM_OPTION) return { ...row, custom: true, name: "" };
        return { ...row, custom: false, name: value };
      })
    );
  }

  function addRow() {
    setCategoryRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeRow(index: number) {
    setCategoryRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setFormError("");

    const categories = categoryRows
      .map((row) => ({ name: row.name.trim(), type: row.type, fee: Number(row.fee) || 0 }))
      .filter((row) => row.name.length > 0);

    if (categories.length === 0) {
      setFormError("Minimal 1 nomor wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createEvent(token, { name, date, location, sport, categories });
      setEvents((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setName("");
      setDate("");
      setLocation("");
      setSport("FINSWIMMING");
      setCategoryRows([{ ...EMPTY_ROW }]);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal membuat event");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  const canCreate = user.role === "ADMIN" || user.role === "COACH";

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Event / Competition"
            description="Jadwal kompetisi, biaya per nomor, dan daftar atlet yang ikut."
            action={
              canCreate && (
                <Button
                  variant={showForm ? "outline" : "primary"}
                  icon={showForm ? <X size={16} /> : <Plus size={16} />}
                  onClick={() => setShowForm((v) => !v)}
                >
                  {showForm ? "Batal" : "Buat Event"}
                </Button>
              )
            }
          />

          {showForm && (
            <Card className="mt-4">
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Nama Event
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Cabang
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as Sport)}
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {SPORT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {SPORT_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                      Lokasi
                    </label>
                    <input
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nomor & Biaya Pendaftaran
                  </label>
                  <div className="flex flex-col gap-2">
                    {categoryRows.map((row, index) => (
                      <div key={index} className="rounded-xl border border-black/10 p-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={row.custom ? CUSTOM_OPTION : row.name}
                            onChange={(e) => updateRowNomor(index, e.target.value)}
                            className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          >
                            <option value="" disabled>
                              Pilih nomor
                            </option>
                            {NOMOR_OPTIONS[sport].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                            <option value={CUSTOM_OPTION}>Lainnya (isi manual)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            disabled={categoryRows.length === 1}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Hapus nomor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {row.custom && (
                          <input
                            value={row.name}
                            onChange={(e) => updateRow(index, "name", e.target.value)}
                            placeholder="Tulis nama nomor sendiri"
                            className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex rounded-lg bg-background p-0.5">
                            {CATEGORY_TYPES.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => updateRow(index, "type", t)}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                  row.type === t
                                    ? "bg-white text-primary shadow-soft"
                                    : "text-foreground/55 hover:text-foreground"
                                }`}
                              >
                                {EVENT_CATEGORY_TYPE_LABEL[t]}
                              </button>
                            ))}
                          </div>
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40">
                              Rp
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={row.fee}
                              onChange={(e) => updateRow(index, "fee", e.target.value)}
                              placeholder="0"
                              className="w-full rounded-xl border border-black/10 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Plus size={14} /> Tambah nomor
                  </button>
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <Button type="submit" disabled={submitting} className="mt-1">
                  {submitting ? "Menyimpan..." : "Simpan Event"}
                </Button>
              </form>
            </Card>
          )}

          {loading && <p className="mt-8 text-sm text-foreground/60">Memuat event...</p>}
          {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-6 flex flex-col gap-3">
              {events.length === 0 && (
                <EmptyState
                  icon={Trophy}
                  title="Belum ada event"
                  description="Event kompetisi yang dibuat akan muncul di sini."
                />
              )}
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-soft transition hover:border-primary/30 hover:shadow-lift"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <Trophy size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">{event.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SPORT_BADGE_CLASS[event.sport]}`}
                      >
                        {SPORT_LABEL[event.sport]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/55">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(event.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {event.location}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {event.categories.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {c.name}
                          {c.type === "ESTAFET" && " (Estafet)"} · {formatRupiah(c.fee)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
