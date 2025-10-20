"use client";

import {
  openf1Client,
  type Driver,
  type IntervalData,
  type StintData,
} from "@/lib/openf1";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface LeaderboardRow {
  position: number;
  driver: Driver;
  gapLabel: string;
  intervalLabel: string;
  compound?: string;
  numberOfLaps?: number;
  status?: string;
}

function normalizeInterval(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(3)}s`;
}

async function fetchLeaderboard(sessionKey: number, drivers: Driver[]) {
  const [intervals, results, stints] = await Promise.all([
    openf1Client.getIntervals(sessionKey),
    openf1Client.getSessionResults(sessionKey),
    openf1Client.getStints(sessionKey),
  ]);

  const driverMap = new Map(
    drivers.map((driver) => [driver.driver_number, driver])
  );
  const stintLookup = buildStintLookup(stints);

  const intervalLatest = pickLatestIntervals(intervals);

  return intervalLatest
    .map((interval) => {
      const driver = driverMap.get(interval.driver_number);
      if (!driver) return null;
      const result = results.find(
        (item) => item.driver_number === interval.driver_number
      );
      const row: LeaderboardRow = {
        position: result?.position ?? 99,
        driver,
        gapLabel: normalizeInterval(interval.gap_to_leader),
        intervalLabel: normalizeInterval(interval.interval),
        numberOfLaps: result?.number_of_laps,
        compound: determineCompound(
          stintLookup.get(driver.driver_number),
          result?.number_of_laps
        ),
        status: result?.dnf ? "DNF" : result?.dsq ? "DSQ" : undefined,
      };
      return row;
    })
    .filter((row): row is LeaderboardRow => row !== null)
    .sort((a, b) => a.position - b.position);
}

function pickLatestIntervals(intervals: IntervalData[]) {
  const latest = new Map<number, IntervalData>();
  intervals.forEach((entry) => {
    const existing = latest.get(entry.driver_number);
    if (!existing) {
      latest.set(entry.driver_number, entry);
      return;
    }
    if (new Date(entry.date).getTime() > new Date(existing.date).getTime()) {
      latest.set(entry.driver_number, entry);
    }
  });
  return Array.from(latest.values());
}

function buildStintLookup(stints: StintData[]) {
  const byDriver = new Map<number, StintData[]>();
  stints.forEach((stint) => {
    if (!byDriver.has(stint.driver_number)) {
      byDriver.set(stint.driver_number, []);
    }
    byDriver.get(stint.driver_number)?.push(stint);
  });
  return byDriver;
}

function determineCompound(
  stints: StintData[] | undefined,
  lapsComplete?: number
) {
  if (!stints || stints.length === 0) return undefined;
  const sorted = [...stints].sort(
    (a, b) => (a.stint_number ?? 0) - (b.stint_number ?? 0)
  );
  if (!lapsComplete) return sorted.at(-1)?.compound;
  return (
    sorted.find((stint) => {
      if (stint.lap_start && stint.lap_end) {
        return lapsComplete >= stint.lap_start && lapsComplete <= stint.lap_end;
      }
      if (stint.lap_start && !stint.lap_end) {
        return lapsComplete >= stint.lap_start;
      }
      return false;
    })?.compound ?? sorted.at(-1)?.compound
  );
}

interface LiveLeaderboardOptions {
  refetchInterval?: number | false;
}

export function useLiveLeaderboard(
  sessionKey?: number,
  drivers?: Driver[],
  options?: LiveLeaderboardOptions
) {
  const driverKey =
    drivers?.map((driver) => driver.driver_number).join("-") ?? "all";

  const { refetchInterval = 5_000 } = options ?? {};

  const query = useQuery({
    queryKey: ["openf1", "leaderboard", sessionKey, driverKey],
    queryFn: () => {
      if (!sessionKey || !drivers || drivers.length === 0)
        return Promise.resolve<LeaderboardRow[]>([]);
      return fetchLeaderboard(sessionKey, drivers);
    },
    enabled: Boolean(sessionKey && drivers && drivers.length > 0),
    refetchInterval,
  });

  const driverCount = drivers?.length ?? 0;
  return useMemo(
    () => ({
      ...query,
      driverCount,
    }),
    [driverCount, query]
  );
}

export type { LeaderboardRow };
