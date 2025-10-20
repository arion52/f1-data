"use client";

import { useLiveLeaderboard } from "@/hooks/useLiveLeaderboard";
import {
  useLatestRaceSession,
  useSessionDrivers,
} from "@/hooks/useLiveSession";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { cn } from "@/lib/utils";
import { LiveLeaderboard } from "./LiveLeaderboard";
import { LiveTelemetryChart } from "./LiveTelemetryChart";

export function LiveDashboard() {
  const sessionQuery = useLatestRaceSession();
  const driversQuery = useSessionDrivers(sessionQuery.data?.session_key);
  const telemetryQuery = useLiveTelemetry(
    sessionQuery.data?.session_key,
    driversQuery.data,
    sessionQuery.isFallback ? { refetchInterval: false } : undefined
  );
  const leaderboardQuery = useLiveLeaderboard(
    sessionQuery.data?.session_key,
    driversQuery.data,
    sessionQuery.isFallback ? { refetchInterval: false } : undefined
  );

  const isLoading =
    sessionQuery.isLoading ||
    driversQuery.isLoading ||
    telemetryQuery.isLoading ||
    leaderboardQuery.isLoading;
  const hasError =
    sessionQuery.isError ||
    driversQuery.isError ||
    telemetryQuery.isError ||
    leaderboardQuery.isError;

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      <header className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
              Live Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {sessionHeading(sessionQuery.data)}
            </h1>
            {sessionQuery.isFallback && (
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-white/50">
                Live feed unavailable · Showing previous Grand Prix
              </p>
            )}
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Monitor real-time speed traces, tyre strategies, and gaps as the
              race unfolds. Hover or tap to inspect lap-by-lap data by driver.
            </p>
          </div>
          <StatusPill
            loading={isLoading}
            error={hasError}
            fallback={sessionQuery.isFallback}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:gap-8">
        <LiveTelemetryChart
          data={telemetryQuery.chartData}
          drivers={driversQuery.data ?? []}
          detailMap={telemetryQuery.detailMap}
          isLoading={telemetryQuery.isFetching}
        />
        <LiveLeaderboard
          rows={leaderboardQuery.data ?? []}
          isLoading={leaderboardQuery.isFetching}
        />
      </div>
    </div>
  );
}

function sessionHeading(
  session?: {
    session_name?: string;
    location?: string;
    date_start?: string;
  } | null
) {
  if (!session) return "Awaiting next race session";
  const date = session.date_start ? new Date(session.date_start) : undefined;
  const formatted = date?.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${session.session_name ?? "Race"} • ${session.location ?? "TBC"}${
    formatted ? ` • ${formatted}` : ""
  }`;
}

interface StatusPillProps {
  loading: boolean;
  error: boolean;
  fallback?: boolean;
}

function StatusPill({ loading, error, fallback }: StatusPillProps) {
  const isFallback = fallback && !error;
  const label = error
    ? "Live data unavailable"
    : isFallback
    ? "Showing previous Grand Prix"
    : loading
    ? "Syncing live data"
    : "Live feed stable";
  const color = error
    ? "bg-rose-500/20 text-rose-200"
    : isFallback
    ? "bg-sky-400/20 text-sky-200"
    : loading
    ? "bg-amber-400/20 text-amber-200"
    : "bg-emerald-500/20 text-emerald-200";
  const dot = error
    ? "bg-rose-400"
    : isFallback
    ? "bg-sky-300"
    : loading
    ? "bg-amber-300"
    : "bg-emerald-300";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]",
        color
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}
