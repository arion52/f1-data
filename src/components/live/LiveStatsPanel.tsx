"use client";

import { getDriverColor } from "@/lib/colors";
import { Driver } from "@/lib/openf1";
import { formatTime } from "@/lib/utils";
import { useMemo } from "react";
import { SectorTimesChart } from "./SectorTimesChart";

interface DriverStats {
  driver: Driver;
  pitStops: number;
  averageLapTime?: number;
  fastestLap?: number;
  fastestSectors: {
    s1?: number;
    s2?: number;
    s3?: number;
  };
  topSpeed?: number;
  positionChange?: number;
}

interface LiveStatsPanelProps {
  stats: DriverStats[];
  isLoading?: boolean;
}

export function LiveStatsPanel({ stats, isLoading }: LiveStatsPanelProps) {
  const sortedByFastestLap = useMemo(() => {
    return [...stats]
      .filter((s) => s.fastestLap !== undefined)
      .sort((a, b) => (a.fastestLap ?? Infinity) - (b.fastestLap ?? Infinity));
  }, [stats]);

  const sortedByTopSpeed = useMemo(() => {
    return [...stats]
      .filter((s) => s.topSpeed !== undefined)
      .sort((a, b) => (b.topSpeed ?? 0) - (a.topSpeed ?? 0));
  }, [stats]);

  const sectorData = useMemo(() => {
    const sectors: Array<{ sector: string; [key: string]: number | string }> = [
      { sector: "Sector 1" },
      { sector: "Sector 2" },
      { sector: "Sector 3" },
    ];

    console.log("🏁 LiveStatsPanel - Stats count:", stats.length);
    console.log("🏁 LiveStatsPanel - Sample stat:", stats[0]);

    stats.forEach((stat) => {
      if (stat.fastestSectors.s1) {
        sectors[0][stat.driver.driver_number] = stat.fastestSectors.s1;
      }
      if (stat.fastestSectors.s2) {
        sectors[1][stat.driver.driver_number] = stat.fastestSectors.s2;
      }
      if (stat.fastestSectors.s3) {
        sectors[2][stat.driver.driver_number] = stat.fastestSectors.s3;
      }
    });

    console.log("🏁 LiveStatsPanel - Sector data:", sectors);
    return sectors;
  }, [stats]);

  const drivers = useMemo(() => stats.map((s) => s.driver), [stats]);

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      {/* Sector Times Chart */}
      <SectorTimesChart
        data={sectorData}
        drivers={drivers}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fastest Lap Times */}
        <div className="rounded-3xl border border-white/5 bg-black/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
                Fastest Laps
              </p>
              <h2 className="text-lg font-semibold text-white">Best times</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
              {isLoading ? "Updating…" : `${sortedByFastestLap.length} drivers`}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {sortedByFastestLap.slice(0, 10).map((stat, index) => (
              <div
                key={stat.driver.driver_number}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getDriverColor(stat.driver) }}
                      aria-hidden
                    />
                    <span className="text-sm font-semibold text-white">
                      {stat.driver.name_acronym}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    index === 0 ? "text-purple-400" : "text-white/70"
                  }`}
                >
                  {formatTime(stat.fastestLap)}
                </span>
              </div>
            ))}
            {sortedByFastestLap.length === 0 && (
              <p className="py-4 text-center text-xs text-white/40">
                No lap time data available yet
              </p>
            )}
          </div>
        </div>

        {/* Top Speeds */}
        <div className="rounded-3xl border border-white/5 bg-black/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
                Speed Trap
              </p>
              <h2 className="text-lg font-semibold text-white">Top speeds</h2>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
              {isLoading ? "Updating…" : "km/h"}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {sortedByTopSpeed.slice(0, 10).map((stat, index) => (
              <div
                key={stat.driver.driver_number}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getDriverColor(stat.driver) }}
                      aria-hidden
                    />
                    <span className="text-sm font-semibold text-white">
                      {stat.driver.name_acronym}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    index === 0 ? "text-amber-400" : "text-white/70"
                  }`}
                >
                  {Math.round(stat.topSpeed ?? 0)} km/h
                </span>
              </div>
            ))}
            {sortedByTopSpeed.length === 0 && (
              <p className="py-4 text-center text-xs text-white/40">
                No speed data available yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pit Stops Summary */}
      <div className="rounded-3xl border border-white/5 bg-black/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
              Pit Stops
            </p>
            <h2 className="text-lg font-semibold text-white">Strategy calls</h2>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
            {isLoading ? "Updating…" : "Total stops"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.driver.driver_number}
              className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getDriverColor(stat.driver) }}
                  aria-hidden
                />
                <span className="text-xs font-semibold text-white">
                  {stat.driver.name_acronym}
                </span>
              </div>
              <span className="text-lg font-bold text-white/70">
                {stat.pitStops} {stat.pitStops === 1 ? "stop" : "stops"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
