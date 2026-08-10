"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Waves } from "lucide-react";
import type { AuthUser } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { getNavItems, ROLE_LABEL } from "@/lib/nav";
import ConfirmDialog from "@/components/ConfirmDialog";

function Logo({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-brand-gradient text-white"
      style={{ height: size + 18, width: size + 18 }}
    >
      <Waves size={size} />
    </div>
  );
}

export default function AppShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navItems = getNavItems(user.role);

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  }

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <Logo />
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">SwimClub</p>
            <p className="text-xs leading-tight text-foreground/45">Management System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/55 hover:bg-black/5 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/5 p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-foreground/45">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/55 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span className="text-sm font-bold text-foreground">SwimClub</span>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="rounded-lg p-2 text-foreground/55 hover:bg-black/5"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/5 bg-white/95 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                active ? "text-primary" : "text-foreground/45"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout"
        message="Yakin ingin logout dari akun ini?"
        confirmLabel="Ya, Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
