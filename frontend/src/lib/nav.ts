import { Home, Trophy, CalendarDays, LineChart, UserCircle, Timer, Users, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/api";

export type NavItem = { href: string; label: string; icon: LucideIcon };

const HOME: NavItem = { href: "/dashboard", label: "Home", icon: Home };
const EVENT: NavItem = { href: "/events", label: "Event", icon: Trophy };
const TRAINING: NavItem = { href: "/training", label: "Training", icon: CalendarDays };
const PERFORMANCE: NavItem = { href: "/performance", label: "Performance", icon: LineChart };
const PROFILE: NavItem = { href: "/profile", label: "Profile", icon: UserCircle };
const TIME_TRIAL: NavItem = { href: "/time-trials", label: "Time Trial", icon: Timer };
const ATHLETES: NavItem = { href: "/admin/athletes", label: "Atlet", icon: Users };

export const ROLE_LABEL: Record<Role, string> = {
  ATHLETE: "Atlet",
  COACH: "Coach",
  ADMIN: "Admin Club",
};

export function getNavItems(role: Role): NavItem[] {
  if (role === "ATHLETE") return [HOME, PERFORMANCE, TRAINING, EVENT, PROFILE];
  if (role === "COACH") return [HOME, TIME_TRIAL, TRAINING, EVENT];
  return [HOME, TIME_TRIAL, TRAINING, EVENT, ATHLETES];
}
