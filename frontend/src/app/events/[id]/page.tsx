"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  CheckCircle2,
  Medal,
  Wallet,
  Users,
  CircleCheck,
  CircleDollarSign,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  getEvent,
  registerForEvent,
  cancelEventRegistration,
  setEventEntryPayment,
  SPORT_LABEL,
} from "@/lib/api";
import type { AuthUser, EventDetail, PaymentStatus, Sport } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/time";
import AppShell from "@/components/AppShell";
import Card, { CardLabel } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";

const SPORT_BADGE_CLASS: Record<Sport, string> = {
  SWIMMING: "bg-primary/10 text-primary",
  FINSWIMMING: "bg-secondary/15 text-secondary",
};

const RESULT_TONE: Record<string, "gold" | "silver" | "bronze"> = {
  GOLD: "gold",
  SILVER: "silver",
  BRONZE: "bronze",
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback((authToken: string, eventId: string) => {
    return getEvent(authToken, eventId).then(setEvent);
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user);
    setToken(session.token);

    load(session.token, params.id)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat event"))
      .finally(() => setLoading(false));
  }, [router, params.id, load]);

  const myEntry = useMemo(() => {
    if (!event || !user) return null;
    return event.entries.find((entry) => entry.athlete.user.id === user.id) || null;
  }, [event, user]);

  const selectedTotal = useMemo(() => {
    if (!event) return 0;
    return event.categories
      .filter((c) => selectedIds.includes(c.id))
      .reduce((sum, c) => sum + c.fee, 0);
  }, [event, selectedIds]);

  function toggleCategory(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!token || selectedIds.length === 0) return;
    setRegisterError("");
    setRegistering(true);
    try {
      await registerForEvent(token, params.id, selectedIds);
      setSelectedIds([]);
      await load(token, params.id);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancel() {
    if (!token) return;
    setCancelling(true);
    setRegisterError("");
    try {
      await cancelEventRegistration(token, params.id);
      await load(token, params.id);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Gagal membatalkan pendaftaran");
    } finally {
      setCancelling(false);
    }
  }

  async function handleTogglePayment(entryId: string, current: PaymentStatus) {
    if (!token) return;
    setPayingId(entryId);
    try {
      await setEventEntryPayment(token, params.id, entryId, current === "PAID" ? "UNPAID" : "PAID");
      await load(token, params.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status bayar");
    } finally {
      setPayingId(null);
    }
  }

  if (!user) return null;

  if (loading) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-foreground/60">Memuat event...</p>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell user={user}>
        <p className="px-6 py-8 text-sm text-red-600">{error || "Event tidak ditemukan"}</p>
      </AppShell>
    );
  }

  const isStaff = user.role === "ADMIN" || user.role === "COACH";
  const isPast = new Date(event.date).getTime() < Date.now();
  const totalCollected = event.entries
    .filter((e) => e.paymentStatus === "PAID")
    .reduce((sum, e) => sum + e.categories.reduce((s, c) => s + c.fee, 0), 0);
  const totalOutstanding = event.entries
    .filter((e) => e.paymentStatus === "UNPAID")
    .reduce((sum, e) => sum + e.categories.reduce((s, c) => s + c.fee, 0), 0);

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={15} /> Kembali ke Event
          </button>

          <Card className="mt-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Trophy size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SPORT_BADGE_CLASS[event.sport]}`}
                  >
                    {SPORT_LABEL[event.sport]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/60">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} /> {formatDate(event.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {event.location}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {event.categories.map((c) => (
                    <span
                      key={c.id}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {c.name}
                      {c.type === "ESTAFET" && " (Estafet)"} · {formatRupiah(c.fee)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {isStaff && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <StatCard icon={Users} label="Total Peserta" value={event.entries.length} tone="primary" />
              <StatCard
                icon={CircleCheck}
                label="Terkumpul"
                value={formatRupiah(totalCollected)}
                tone="green"
              />
              <StatCard
                icon={CircleDollarSign}
                label="Belum Terbayar"
                value={formatRupiah(totalOutstanding)}
                tone="gold"
              />
            </div>
          )}

          {user.role === "ATHLETE" && (
            <Card className="mt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wallet size={16} />
                </div>
                <CardLabel>Pendaftaran Kamu</CardLabel>
              </div>

              {myEntry ? (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(myEntry.categories ?? []).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {c.category.name}
                        {c.category.type === "ESTAFET" && " (Estafet)"} · {formatRupiah(c.fee)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-foreground/60">
                      Total biaya:{" "}
                      <span className="font-bold text-foreground">
                        {formatRupiah((myEntry.categories ?? []).reduce((s, c) => s + c.fee, 0))}
                      </span>
                    </p>
                    <Badge tone={myEntry.paymentStatus === "PAID" ? "green" : "gold"}>
                      {myEntry.paymentStatus === "PAID" ? "Sudah Bayar" : "Belum Bayar"}
                    </Badge>
                  </div>
                  {registerError && <p className="mt-2 text-sm text-red-600">{registerError}</p>}
                  {myEntry.paymentStatus === "UNPAID" && !isPast && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="mt-3 w-full"
                    >
                      {cancelling ? "Membatalkan..." : "Batalkan Pendaftaran"}
                    </Button>
                  )}
                  {myEntry.paymentStatus === "PAID" && (
                    <p className="mt-3 text-xs text-foreground/45">
                      Pembayaran sudah dikonfirmasi. Hubungi admin/coach kalau perlu membatalkan.
                    </p>
                  )}
                </div>
              ) : isPast ? (
                <p className="mt-3 text-sm text-foreground/55">
                  Event sudah lewat, pendaftaran ditutup.
                </p>
              ) : (
                <form onSubmit={handleRegister} className="mt-3">
                  <p className="text-sm text-foreground/55">Pilih nomor yang ingin diikuti:</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {event.categories.map((c) => (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition ${
                          selectedIds.includes(c.id)
                            ? "border-primary bg-primary/5"
                            : "border-black/10 hover:bg-black/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleCategory(c.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          {c.name}
                          {c.type === "ESTAFET" && (
                            <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                              Estafet
                            </span>
                          )}
                        </span>
                        <span className="text-foreground/60">{formatRupiah(c.fee)}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-background px-3.5 py-2.5 text-sm">
                    <span className="text-foreground/60">Total biaya</span>
                    <span className="font-bold text-foreground">{formatRupiah(selectedTotal)}</span>
                  </div>

                  {registerError && <p className="mt-2 text-sm text-red-600">{registerError}</p>}

                  <Button
                    type="submit"
                    disabled={registering || selectedIds.length === 0}
                    className="mt-3 w-full"
                  >
                    {registering ? "Mendaftar..." : "Daftar Sekarang"}
                  </Button>
                </form>
              )}
            </Card>
          )}

          <Card className="mt-4">
            <CardLabel>Atlet yang ikut ({event.entries.length})</CardLabel>
            {event.entries.length === 0 ? (
              <div className="mt-3">
                <EmptyState icon={Medal} title="Belum ada atlet terdaftar" />
              </div>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-black/5">
                {event.entries.map((entry) => {
                  const total = (entry.categories ?? []).reduce((s, c) => s + c.fee, 0);
                  return (
                    <li key={entry.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-foreground">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          {entry.athlete.user.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {entry.result && (
                            <Badge tone={RESULT_TONE[entry.result] || "neutral"} icon={<Medal size={12} />}>
                              {entry.result}
                            </Badge>
                          )}
                          {isStaff && (
                            <button
                              onClick={() => handleTogglePayment(entry.id, entry.paymentStatus)}
                              disabled={payingId === entry.id}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                                entry.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-gold/15 text-gold hover:bg-gold/25"
                              }`}
                            >
                              {payingId === entry.id
                                ? "..."
                                : entry.paymentStatus === "PAID"
                                  ? "Sudah Bayar"
                                  : "Belum Bayar"}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-6">
                        {(entry.categories ?? []).map((c) => (
                          <span
                            key={c.id}
                            className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground/60"
                          >
                            {c.category.name}
                            {c.category.type === "ESTAFET" && " (Estafet)"}
                          </span>
                        ))}
                        {isStaff && (entry.categories ?? []).length > 0 && (
                          <span className="text-[11px] text-foreground/45">
                            Total {formatRupiah(total)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
