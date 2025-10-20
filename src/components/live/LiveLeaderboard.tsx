"use client";

import type { LeaderboardRow } from "@/hooks/useLiveLeaderboard";
import { getDriverColor, getTyreColor } from "@/lib/colors";
import Image from "next/image";

interface LiveLeaderboardProps {
  rows: LeaderboardRow[];
  isLoading?: boolean;
}

export function LiveLeaderboard({ rows, isLoading }: LiveLeaderboardProps) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Live Leaderboard
          </p>
          <h2 className="text-lg font-semibold text-white">Current order</h2>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
          {isLoading
            ? "Refreshing…"
            : `Updated • ${new Date().toLocaleTimeString()}`}
        </span>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        <table className="min-w-full text-left text-sm text-white/70">
          <thead className="sticky top-0 bg-black/80 text-xs uppercase tracking-[0.2em] text-white/40">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Tyre</th>
              <th className="px-4 py-3">Interval</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Laps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr
                key={row.driver.driver_number}
                className="transition hover:bg-white/5"
              >
                <td className="px-4 py-3 text-xs font-semibold text-white/70">
                  {row.position}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.driver.headshot_url ? (
                      <span className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10">
                        <Image
                          src={row.driver.headshot_url}
                          alt={
                            row.driver.full_name ?? row.driver.broadcast_name
                          }
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white/80">
                        {row.driver.name_acronym}
                      </span>
                    )}
                    <div className="flex flex-col text-xs">
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: getDriverColor(row.driver),
                          }}
                          aria-hidden
                        />
                        {row.driver.broadcast_name}
                        {row.status ? (
                          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-300">
                            {row.status}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-white/50">
                        {row.driver.team_name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 font-semibold text-white">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getTyreColor(row.compound) }}
                      aria-hidden
                    />
                    {row.compound ?? "--"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-amber-300">
                  {row.intervalLabel}
                </td>
                <td className="px-4 py-3 text-xs">{row.gapLabel}</td>
                <td className="px-4 py-3 text-xs text-white/60">
                  {row.numberOfLaps ?? "--"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-xs text-white/40"
                >
                  No live intervals available yet. Check back when the session
                  is active.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
