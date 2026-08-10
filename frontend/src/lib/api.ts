const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Role = "ATHLETE" | "COACH" | "ADMIN";
export type Sport = "SWIMMING" | "FINSWIMMING";

export const SPORT_LABEL: Record<Sport, string> = {
  SWIMMING: "Swimming",
  FINSWIMMING: "Finswimming",
};

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
  condition: string | null;
  coachNote: string | null;
  startRating: number | null;
  speedRating: number | null;
  techniqueRating: number | null;
  recommendation: string | null;
};

export type EventCategoryType = "INDIVIDU" | "ESTAFET";

export const EVENT_CATEGORY_TYPE_LABEL: Record<EventCategoryType, string> = {
  INDIVIDU: "Individu",
  ESTAFET: "Estafet",
};

export type EventCategory = {
  id: string;
  name: string;
  type: EventCategoryType;
  fee: number;
};

export type PaymentStatus = "PAID" | "UNPAID";

export type EventEntryCategorySelection = {
  id: string;
  fee: number;
  category: EventCategory;
};

export type EventEntry = {
  id: string;
  result: string | null;
  paymentStatus: PaymentStatus;
  registeredAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
    categories: EventCategory[];
  };
  categories: EventEntryCategorySelection[];
};

export type AthleteMe = {
  id: string;
  athleteNumber: string | null;
  kta: string | null;
  birthDate: string | null;
  category: string | null;
  sport: Sport;
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

async function authedPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan data");
  }

  return data;
}

async function authedPut<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan data");
  }

  return data;
}

async function authedPatch<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan data");
  }

  return data;
}

async function authedDelete(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Gagal menghapus data");
  }
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

export type EventSummary = {
  id: string;
  name: string;
  date: string;
  location: string;
  sport: Sport;
  categories: EventCategory[];
};

export type EventParticipant = {
  id: string;
  result: string | null;
  paymentStatus: PaymentStatus;
  registeredAt: string;
  athlete: {
    id: string;
    user: { id: string; name: string };
  };
  categories: EventEntryCategorySelection[];
};

export type EventDetail = EventSummary & {
  entries: EventParticipant[];
};

export function listEvents(token: string) {
  return authedGet<EventSummary[]>("/api/events", token);
}

export function getEvent(token: string, id: string) {
  return authedGet<EventDetail>(`/api/events/${id}`, token);
}

export function createEvent(
  token: string,
  input: {
    name: string;
    date: string;
    location: string;
    sport: Sport;
    categories: { name: string; type: EventCategoryType; fee: number }[];
  }
) {
  return authedPost<EventSummary>("/api/events", token, input);
}

export function registerForEvent(token: string, eventId: string, categoryIds: string[]) {
  return authedPost<EventEntry>(`/api/events/${eventId}/register`, token, { categoryIds });
}

export function cancelEventRegistration(token: string, eventId: string) {
  return authedDelete(`/api/events/${eventId}/register`, token);
}

export function setEventEntryPayment(
  token: string,
  eventId: string,
  entryId: string,
  paymentStatus: PaymentStatus
) {
  return authedPatch<EventParticipant>(`/api/events/${eventId}/entries/${entryId}/payment`, token, {
    paymentStatus,
  });
}

export type AthleteSummary = {
  id: string;
  sport: Sport;
  user: { id: string; name: string };
};

export function listAthletes(token: string, sport?: Sport) {
  return authedGet<AthleteSummary[]>(
    `/api/athletes${sport ? `?sport=${sport}` : ""}`,
    token
  );
}

export type AdminAthlete = {
  id: string;
  athleteNumber: string | null;
  kta: string | null;
  birthDate: string | null;
  category: string | null;
  sport: Sport;
  club: string | null;
  user: { id: string; name: string; email: string };
};

export function listAthletesAdmin(token: string) {
  return authedGet<AdminAthlete[]>("/api/athletes", token);
}

export function updateAthleteProfile(
  token: string,
  id: string,
  input: {
    athleteNumber?: string;
    kta?: string;
    birthDate?: string;
    category?: string;
    sport?: Sport;
    club?: string;
  }
) {
  return authedPut<AdminAthlete>(`/api/athletes/${id}`, token, input);
}

export async function registerAthlete(input: {
  name: string;
  email: string;
  password: string;
  sport?: Sport;
}): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal mendaftar");
  }

  return data;
}

export function getTimeTrialsByAthlete(token: string, athleteId: string) {
  return authedGet<TimeTrial[]>(`/api/time-trials/athlete/${athleteId}`, token);
}

export function createTimeTrial(
  token: string,
  input: {
    athleteId: string;
    category: string;
    date: string;
    time: string;
    condition?: string;
    coachNote?: string;
    startRating?: number;
    speedRating?: number;
    techniqueRating?: number;
    recommendation?: string;
  }
) {
  return authedPost<TimeTrial>("/api/time-trials", token, input);
}

export function listTraining(token: string, from: string, to: string) {
  return authedGet<TrainingSession[]>(
    `/api/training?from=${from}&to=${to}`,
    token
  );
}

export function createTrainingSession(
  token: string,
  input: { title: string; date: string; startTime?: string; endTime?: string; description?: string }
) {
  return authedPost<TrainingSession>("/api/training", token, input);
}
