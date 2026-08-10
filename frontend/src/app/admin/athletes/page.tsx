"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Users, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listAthletesAdmin, updateAthleteProfile, registerAthlete, SPORT_LABEL } from "@/lib/api";
import type { AdminAthlete, Sport, AuthUser } from "@/lib/api";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PillGroup from "@/components/ui/PillGroup";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

const CATEGORY_OPTIONS = ["JUNIOR", "SENIOR"];
const SPORT_OPTIONS: Sport[] = ["SWIMMING", "FINSWIMMING"];

function EditAthleteForm({
  athlete,
  token,
  onSaved,
  onCancel,
}: {
  athlete: AdminAthlete;
  token: string;
  onSaved: (updated: AdminAthlete) => void;
  onCancel: () => void;
}) {
  const [athleteNumber, setAthleteNumber] = useState(athlete.athleteNumber || "");
  const [kta, setKta] = useState(athlete.kta || "");
  const [birthDate, setBirthDate] = useState(
    athlete.birthDate ? athlete.birthDate.slice(0, 10) : ""
  );
  const [category, setCategory] = useState(athlete.category || "");
  const [sport, setSport] = useState<Sport>(athlete.sport);
  const [club, setClub] = useState(athlete.club || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await updateAthleteProfile(token, athlete.id, {
        athleteNumber: athleteNumber || undefined,
        kta: kta || undefined,
        birthDate: birthDate || undefined,
        category: category || undefined,
        sport,
        club: club || undefined,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Nomor Atlet</label>
          <input
            value={athleteNumber}
            onChange={(e) => setAthleteNumber(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">KTA</label>
          <input
            value={kta}
            onChange={(e) => setKta(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Tanggal Lahir</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">-</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Cabang</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value as Sport)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {SPORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SPORT_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground">Club</label>
          <input
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="px-3 py-1.5 text-sm">
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-3 py-1.5 text-sm">
          Batal
        </Button>
      </div>
    </form>
  );
}

export default function AdminAthletesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<AdminAthlete[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<Sport | "ALL">("ALL");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newSport, setNewSport] = useState<Sport>("FINSWIMMING");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setUser(session.user);
    setToken(session.token);

    listAthletesAdmin(session.token)
      .then(setAthletes)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat atlet"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAddAthlete(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAddError("");
    setAdding(true);
    try {
      await registerAthlete({ name: newName, email: newEmail, password: newPassword, sport: newSport });
      const refreshed = await listAthletesAdmin(token);
      setAthletes(refreshed);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewSport("FINSWIMMING");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Gagal menambah atlet");
    } finally {
      setAdding(false);
    }
  }

  if (!user || !token) return null;

  const visibleAthletes = athletes.filter((a) => sportFilter === "ALL" || a.sport === sportFilter);

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            title="Database Atlet"
            description="Kelola data dan biodata atlet club."
            action={
              <Button
                variant={showAddForm ? "outline" : "primary"}
                icon={showAddForm ? <X size={16} /> : <Plus size={16} />}
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? "Batal" : "Tambah Atlet"}
              </Button>
            }
          />

          {showAddForm && (
            <Card className="mt-4">
              <form onSubmit={handleAddAthlete} className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Nama</label>
                    <input
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                    <input
                      required
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      Password Awal
                    </label>
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Cabang</label>
                    <select
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value as Sport)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      {SPORT_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {SPORT_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {addError && <p className="text-sm text-red-600">{addError}</p>}
                <Button type="submit" disabled={adding} className="mt-1">
                  {adding ? "Menyimpan..." : "Simpan Atlet"}
                </Button>
              </form>
            </Card>
          )}

          <div className="mt-4">
            <PillGroup
              options={["ALL", ...SPORT_OPTIONS] as const}
              value={sportFilter}
              onChange={setSportFilter}
              labelFor={(s) => (s === "ALL" ? "Semua" : SPORT_LABEL[s as Sport])}
            />
          </div>

          {loading && <p className="mt-8 text-sm text-foreground/60">Memuat data atlet...</p>}
          {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-4 flex flex-col gap-3">
              {visibleAthletes.length === 0 && (
                <EmptyState icon={Users} title="Tidak ada atlet untuk filter ini" />
              )}
              {visibleAthletes.map((athlete) => (
                <Card key={athlete.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {athlete.user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{athlete.user.name}</p>
                        <p className="text-xs text-foreground/50">{athlete.user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      icon={<Pencil size={14} />}
                      onClick={() => setEditingId(editingId === athlete.id ? null : athlete.id)}
                      className="px-3 py-1.5 text-sm"
                    >
                      {editingId === athlete.id ? "Tutup" : "Edit"}
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                    <Badge>No. Atlet: {athlete.athleteNumber || "-"}</Badge>
                    <Badge>KTA: {athlete.kta || "-"}</Badge>
                    <Badge>Kategori: {athlete.category || "-"}</Badge>
                    <Badge tone="primary">{SPORT_LABEL[athlete.sport]}</Badge>
                    <Badge>Club: {athlete.club || "-"}</Badge>
                  </div>

                  {editingId === athlete.id && (
                    <EditAthleteForm
                      athlete={athlete}
                      token={token}
                      onSaved={(updated) => {
                        setAthletes((prev) =>
                          prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
                        );
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
