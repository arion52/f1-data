"use client";

import { openf1Client, type Driver } from "@/lib/openf1";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export interface DriverStats {
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

async function fetchDriverStats(
  sessionKey: number,
  drivers: Driver[]
): Promise<DriverStats[]> {
  console.log(
    "📈 fetchDriverStats - Session:",
    sessionKey,
    "Drivers:",
    drivers.length
  );

  const driverNumbers = drivers.map((d) => d.driver_number);

  const [laps, stints] = await Promise.all([
    openf1Client.getLaps(sessionKey, driverNumbers, 80),
    openf1Client.getStints(sessionKey),
  ]);

  console.log("📈 fetchDriverStats - Laps fetched:", laps.length);
  console.log("📈 fetchDriverStats - Stints fetched:", stints.length);
  console.log("📈 fetchDriverStats - Sample lap:", laps[0]);

  return drivers.map((driver) => {
    const driverLaps = laps.filter(
      (lap) => lap.driver_number === driver.driver_number
    );

    // Calculate pit stops (number of stints minus 1)
    const driverStints = stints.filter(
      (stint) => stint.driver_number === driver.driver_number
    );
    const pitStops = Math.max(0, driverStints.length - 1);

    // Find fastest lap
    const validLapTimes = driverLaps
      .filter((lap) => lap.lap_duration && !lap.is_pit_out_lap)
      .map((lap) => lap.lap_duration!);
    const fastestLap =
      validLapTimes.length > 0 ? Math.min(...validLapTimes) : undefined;

    // Calculate average lap time
    const averageLapTime =
      validLapTimes.length > 0
        ? validLapTimes.reduce((sum, time) => sum + time, 0) /
          validLapTimes.length
        : undefined;

    // Find top speed
    const speeds = driverLaps
      .map((lap) => lap.st_speed ?? lap.i1_speed ?? lap.i2_speed)
      .filter((speed): speed is number => speed !== undefined);
    const topSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;

    // Find fastest sectors
    const s1Times = driverLaps
      .map((lap) => lap.duration_sector_1)
      .filter((time): time is number => time !== undefined);
    const s2Times = driverLaps
      .map((lap) => lap.duration_sector_2)
      .filter((time): time is number => time !== undefined);
    const s3Times = driverLaps
      .map((lap) => lap.duration_sector_3)
      .filter((time): time is number => time !== undefined);

    return {
      driver,
      pitStops,
      averageLapTime,
      fastestLap,
      fastestSectors: {
        s1: s1Times.length > 0 ? Math.min(...s1Times) : undefined,
        s2: s2Times.length > 0 ? Math.min(...s2Times) : undefined,
        s3: s3Times.length > 0 ? Math.min(...s3Times) : undefined,
      },
      topSpeed,
    };
  });
}

interface LiveStatsOptions {
  refetchInterval?: number | false;
}

export function useLiveStats(
  sessionKey?: number,
  drivers?: Driver[],
  options?: LiveStatsOptions
) {
  const driverKey =
    drivers?.map((driver) => driver.driver_number).join("-") ?? "all";

  const { refetchInterval = 30_000 } = options ?? {}; // Changed from 10s to 30s

  const query = useQuery({
    queryKey: ["openf1", "stats", sessionKey, driverKey],
    queryFn: () => {
      if (!sessionKey || !drivers || drivers.length === 0) {
        return Promise.resolve<DriverStats[]>([]);
      }
      return fetchDriverStats(sessionKey, drivers);
    },
    enabled: Boolean(sessionKey && drivers && drivers.length > 0),
    refetchInterval,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return useMemo(
    () => ({
      ...query,
    }),
    [query]
  );
}
