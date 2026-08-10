const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Role = "ATHLETE" | "COACH" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal login");
  }

  return data;
}

export type TimeTrial = {
  id: string;
  category: string;
  date: string;
  time: string;
};

export type EventEntry = {
  id: string;
  result: string | null;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
    categories: string[];
  };
};

export type AthleteMe = {
  id: string;
  athleteNumber: string | null;
  kta: string | null;
  birthDate: string | null;
  category: string | null;
  club: string | null;
  photoUrl: string | null;
  user: { id: string; name: string; email: string };
  timeTrials: TimeTrial[];
  eventEntries: EventEntry[];
};

export type TrainingSession = {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
};

async function authedGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal mengambil data");
  }

  return data;
}

export function getMyAthleteProfile(token: string) {
  return authedGet<AthleteMe>("/api/athletes/me", token);
}

export function getTodayTraining(token: string) {
  return authedGet<TrainingSession[]>("/api/training/today", token);
}

export type NeedAttentionAthlete = {
  id: string;
  name: string;
  reason: string;
};

export type CoachDashboardStats = {
  totalAthletes: number;
  activeTraining: number;
  averageImprovement: number | null;
  needAttention: NeedAttentionAthlete[];
};

export function getCoachDashboard(token: string) {
  return authedGet<CoachDashboardStats>("/api/coach/dashboard", token);
}
