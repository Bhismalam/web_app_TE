export function parseTimeToSeconds(time: string): number {
  const [min, sec] = time.split(":");
  return Number(min) * 60 + Number(sec);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
