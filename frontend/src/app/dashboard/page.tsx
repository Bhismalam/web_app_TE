"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user);
  }, [router]);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Halo, {user.name} 👋</h1>
            <p className="text-sm text-foreground/60">Role: {user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm text-foreground/60">
            Dashboard {user.role.toLowerCase()} akan dibangun di sini (Performance, Training,
            Competition, dst).
          </p>
        </div>
      </div>
    </div>
  );
}
