"use client";

import { openf1Client, type Driver, type Session } from "@/lib/openf1";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function hasSessionStarted(session?: Session | null) {
  if (!session) return false;
  if (!session.date_start) return true;
  const start = Date.parse(session.date_start);
  if (Number.isNaN(start)) return true;
  const now = Date.now();
  return now >= start;
}
export function useLatestRaceSession() {
  const latestQuery = useQuery<Session | null, Error>({
    queryKey: ["openf1", "session", "latest"],
    queryFn: () => openf1Client.getLatestRaceSession(),
    refetchInterval: 60_000,
  });

  const shouldFetchFallback =
    !latestQuery.isFetching && !hasSessionStarted(latestQuery.data);

  const fallbackQuery = useQuery<Session | null, Error>({
    queryKey: [
      "openf1",
      "session",
      "fallback",
      latestQuery.data?.meeting_key ?? "none",
    ],
    queryFn: () =>
      openf1Client.getMostRecentCompletedRaceSession(
        latestQuery.data?.meeting_key
      ),
    enabled: shouldFetchFallback,
    staleTime: 15 * 60_000,
  });

  const data = useMemo(
    () =>
      hasSessionStarted(latestQuery.data)
        ? latestQuery.data
        : fallbackQuery.data ?? latestQuery.data ?? null,
    [fallbackQuery.data, latestQuery.data]
  );
  const isFallback =
    !hasSessionStarted(latestQuery.data) && Boolean(fallbackQuery.data);

  const combinedLoading = latestQuery.isLoading || fallbackQuery.isLoading;
  const combinedFetching = latestQuery.isFetching || fallbackQuery.isFetching;

  const fallbackDataAvailable = Boolean(fallbackQuery.data);
  const fallbackErrorActive =
    shouldFetchFallback && fallbackQuery.isError && !fallbackDataAvailable;
  const latestErrorActive =
    !shouldFetchFallback && latestQuery.isError && !latestQuery.data;

  const combinedError = fallbackErrorActive || latestErrorActive;
  const error = fallbackErrorActive
    ? fallbackQuery.error ?? latestQuery.error ?? null
    : latestErrorActive
    ? latestQuery.error ?? null
    : null;

  return {
    ...latestQuery,
    data,
    isFallback,
    fallbackSession: fallbackQuery.data ?? null,
    isLoading: combinedLoading,
    isFetching: combinedFetching,
    isError: combinedError,
    error,
  };
}

export function useSessionDrivers(sessionKey?: number) {
  return useQuery<Driver[]>({
    queryKey: ["openf1", "drivers", sessionKey],
    queryFn: () => {
      if (!sessionKey) return Promise.resolve([]);
      return openf1Client.getDrivers(sessionKey);
    },
    enabled: Boolean(sessionKey),
    staleTime: 5 * 60_000,
    refetchInterval: 120_000,
  });
}
