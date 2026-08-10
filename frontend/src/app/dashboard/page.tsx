"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/nav";
import AppShell from "@/components/AppShell";
import AthleteDashboard from "@/components/AthleteDashboard";
import CoachDashboard from "@/components/CoachDashboard";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user);
    setToken(session.token);
  }, [router]);

  if (!user || !token) return null;

  return (
    <AppShell user={user}>
      <div className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-dot-grid relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-7 text-white shadow-lift sm:px-8">
            <p className="text-sm text-white/75">
              {greeting()}, {ROLE_LABEL[user.role]}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Halo, {user.name} 👋</h1>
          </div>

          {user.role === "ATHLETE" && <AthleteDashboard user={user} token={token} />}
          {(user.role === "COACH" || user.role === "ADMIN") && <CoachDashboard token={token} />}
        </div>
      </div>
    </AppShell>
  );
}
