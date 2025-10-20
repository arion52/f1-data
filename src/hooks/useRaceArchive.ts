"use client";

import {
  openf1Client,
  type Driver,
  type RaceMeeting,
  type Session,
  type StintData,
} from "@/lib/openf1";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLiveTelemetry } from "./useLiveTelemetry";

export interface RaceFilters {
  year?: number;
  driverNumber?: number;
  circuit?: string;
}

export function useRaceMeetings(filters: RaceFilters) {
  return useQuery<RaceMeeting[]>({
    queryKey: ["openf1", "meetings", filters],
    queryFn: async () => {
      const meetings = await openf1Client.getRaceMeetings({
        year: filters.year,
      });

      const raceMeetings = meetings.filter((meeting) => {
        const name = meeting.meeting_name?.toLowerCase() ?? "";
        return !name.includes("testing");
      });

      const circuitSearch = filters.circuit?.trim().toLowerCase();
      let filtered = circuitSearch
        ? raceMeetings.filter((meeting) => {
            const circuit = meeting.circuit_short_name ?? "";
            const location = meeting.location ?? "";
            const name = meeting.meeting_name ?? "";
            return [circuit, location, name]
              .map((value) => value.toLowerCase())
              .some((value) => value.includes(circuitSearch));
          })
        : raceMeetings;

      if (filters.driverNumber) {
        const allowedMeetingKeys = new Set(
          raceMeetings.map((meeting) => meeting.meeting_key)
        );
        const driverResults = await openf1Client.getDriverSessionResults(
          filters.driverNumber
        );
        const meetingKeys = new Set(
          driverResults
            .map((result) => result.meeting_key)
            .filter(
              (value): value is number =>
                typeof value === "number" && allowedMeetingKeys.has(value)
            )
        );

        filtered = filtered.filter((meeting) =>
          meetingKeys.has(meeting.meeting_key)
        );
      }

      return [...filtered].sort((a, b) => {
        const aTime = new Date(a.date_start).getTime();
        const bTime = new Date(b.date_start).getTime();
        return bTime - aTime;
      });
    },
    staleTime: 5 * 60_000,
  });
}

export function useMeetingRaceSession(meetingKey?: number) {
  return useQuery<Session | null>({
    queryKey: ["openf1", "meeting-session", meetingKey],
    queryFn: async () => {
      if (!meetingKey) return null;
      const sessions = await openf1Client.getSessions({
        meeting_key: meetingKey,
        session_type: "Race",
      });
      return sessions.at(0) ?? null;
    },
    enabled: Boolean(meetingKey),
    staleTime: 5 * 60_000,
  });
}

export function useMeetingDrivers(sessionKey?: number) {
  return useQuery<Driver[]>({
    queryKey: ["openf1", "meeting-drivers", sessionKey],
    queryFn: () => {
      if (!sessionKey) return Promise.resolve([]);
      return openf1Client.getDrivers(sessionKey);
    },
    enabled: Boolean(sessionKey),
    staleTime: 10 * 60_000,
  });
}

export function useRaceTelemetry(sessionKey?: number, drivers?: Driver[]) {
  const telemetry = useLiveTelemetry(sessionKey, drivers, {
    refetchInterval: false,
  });
  return useMemo(
    () => ({
      ...telemetry,
      // disable polling for archive view
      refetch: telemetry.refetch,
    }),
    [telemetry]
  );
}

export function useSessionStints(sessionKey?: number) {
  return useQuery<StintData[]>({
    queryKey: ["openf1", "stints", sessionKey],
    queryFn: () => {
      if (!sessionKey) return Promise.resolve([]);
      return openf1Client.getStints(sessionKey);
    },
    enabled: Boolean(sessionKey),
    staleTime: 10 * 60_000,
  });
}
