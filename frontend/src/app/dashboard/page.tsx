"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/api";
import AthleteDashboard from "@/components/AthleteDashboard";
import CoachDashboard from "@/components/CoachDashboard";

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

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  if (!user || !token) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Halo, {user.name} 👋</h1>
            <p className="text-sm text-foreground/60">Role: {user.role}</p>
          </div>
          <div className="flex gap-2">
            {user.role === "ATHLETE" && (
              <Link
                href="/profile"
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5"
              >
                Profile
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-black/5"
            >
              Logout
            </button>
          </div>
        </div>

        {user.role === "ATHLETE" ? (
          <AthleteDashboard user={user} token={token} />
        ) : (
          <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-foreground/60">
              Dashboard {user.role.toLowerCase()} akan dibangun di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
