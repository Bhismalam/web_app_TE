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
