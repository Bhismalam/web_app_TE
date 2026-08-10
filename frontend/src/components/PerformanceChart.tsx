"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { TimeTrial } from "@/lib/api";
import { parseTimeToSeconds } from "@/lib/time";

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, "0");
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { dateLabel: string; time: string } }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{point.time}</p>
      <p className="text-foreground/60">{point.dateLabel}</p>
    </div>
  );
}

export default function PerformanceChart({ trials }: { trials: TimeTrial[] }) {
  const sorted = [...trials].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = sorted.map((trial) => ({
    dateLabel: new Date(trial.date).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    seconds: parseTimeToSeconds(trial.time),
    time: trial.time,
  }));

  if (data.length === 0) {
    return <p className="text-sm text-foreground/60">Belum ada data time trial.</p>;
  }

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              reversed
              tickFormatter={formatSeconds}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <Tooltip content={<TooltipContent />} />
            <Line
              type="monotone"
              dataKey="seconds"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 4, fill: "#059669", stroke: "#f5f8fc", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#059669", stroke: "#f5f8fc", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-foreground/45">
        <TrendingUp size={13} />
        Garis naik = waktu makin cepat (progress)
      </p>
    </div>
  );
}
