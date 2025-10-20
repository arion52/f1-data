const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const FASTF1_FALLBACK_URL = process.env.NEXT_PUBLIC_FASTF1_BASE_URL ?? "";

export type Primitive = string | number | boolean | undefined | null;
export type QueryParams = Record<string, Primitive | Primitive[]>;

// Helper to add delay between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithFallback<T>(
  path: string,
  params?: QueryParams,
  retryCount = 0
): Promise<T> {
  const url = buildUrl(OPENF1_BASE_URL, path, params);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (response.ok) {
      return response.json();
    }

    // If rate limited, wait and retry
    if (response.status === 429 && retryCount < 3) {
      const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(
        `⏳ Rate limited, waiting ${waitTime}ms before retry ${
          retryCount + 1
        }/3`
      );
      await delay(waitTime);
      return fetchWithFallback<T>(path, params, retryCount + 1);
    }

    // Only try fallback if it's configured
    if (FASTF1_FALLBACK_URL) {
      console.log("🔄 Trying fallback proxy...");
      const fallbackUrl = buildUrl(FASTF1_FALLBACK_URL, path, params);
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      });

      if (!fallbackResponse.ok) {
        throw new Error(
          `OpenF1 request failed: ${response.status} / fallback ${fallbackResponse.status}`
        );
      }

      return fallbackResponse.json();
    }

    throw new Error(`OpenF1 request failed: ${response.status}`);
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
}

function buildUrl(base: string, path: string, params?: QueryParams) {
  const url = new URL(path.replace(/^\//, ""), `${base.replace(/\/$/, "")}/`);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item === undefined || item === null || item === "") return;
          searchParams.append(key, String(item));
        });
        return;
      }
      searchParams.set(key, String(value));
    });
    url.search = searchParams.toString();
  }
  return url.toString();
}

export interface Session {
  session_key: number;
  meeting_key: number;
  date_start: string;
  date_end: string;
  session_type: string;
  session_name: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  year?: number;
}

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  name_acronym: string;
  team_name: string;
  team_colour?: string;
  headshot_url?: string;
  full_name?: string;
}

export interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration?: number;
  is_pit_out_lap?: boolean;
  st_speed?: number;
  date_start?: string;
  i1_speed?: number;
  i2_speed?: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
}

export interface StintData {
  driver_number: number;
  stint_number: number;
  compound?: string;
  lap_start?: number;
  lap_end?: number;
  tyre_age_at_start?: number;
}

export interface IntervalData {
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface SessionResultData {
  driver_number: number;
  position: number;
  number_of_laps?: number;
  duration?: number | number[];
  gap_to_leader?: number | string | (number | string)[];
  dnf?: boolean;
  dsq?: boolean;
  dns?: boolean;
  meeting_key?: number;
  session_key?: number;
  points?: number;
}

export interface RaceMeeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name?: string;
  date_start: string;
  location: string;
  country_name: string;
  year: number;
  circuit_short_name?: string;
}

export const openf1Client = {
  async getLatestRaceSession(): Promise<Session | null> {
    const sessions = await fetchWithFallback<Session[]>("sessions", {
      session_key: "latest",
      session_type: "Race",
    });
    return sessions.at(0) ?? null;
  },

  async getMostRecentCompletedRaceSession(
    excludeMeetingKey?: number
  ): Promise<Session | null> {
    const sessions = await fetchWithFallback<Session[]>("sessions", {
      session_type: "Race",
      order: "date_end.desc",
      limit: 20,
    });

    const now = Date.now();

    const completed = sessions
      .filter((session) => {
        if (excludeMeetingKey && session.meeting_key === excludeMeetingKey) {
          return false;
        }
        if (!session.date_end) return false;
        const endTime = new Date(session.date_end).getTime();
        return Number.isFinite(endTime) && endTime <= now;
      })
      .sort((a, b) => {
        const aTime = new Date(a.date_end ?? a.date_start ?? 0).getTime();
        const bTime = new Date(b.date_end ?? b.date_start ?? 0).getTime();
        return bTime - aTime;
      });

    if (completed.length > 0) {
      return completed[0];
    }

    return (
      sessions
        .filter((session) => session.meeting_key !== excludeMeetingKey)
        .at(0) ?? null
    );
  },

  async getSessions(params: QueryParams): Promise<Session[]> {
    return fetchWithFallback<Session[]>("sessions", params);
  },

  async getDrivers(sessionKey: number): Promise<Driver[]> {
    return fetchWithFallback<Driver[]>("drivers", { session_key: sessionKey });
  },

  async getLaps(
    sessionKey: number,
    driverNumbers?: number[],
    limit = 60
  ): Promise<LapData[]> {
    try {
      // Fetch ALL laps for the session (no lap_number filter as API doesn't support <=)
      const allLaps = await fetchWithFallback<LapData[]>("laps", {
        session_key: sessionKey,
      });

      // Filter by driver numbers if specified
      let filtered = allLaps;

      if (driverNumbers && driverNumbers.length > 0) {
        filtered = filtered.filter((lap) =>
          driverNumbers.includes(lap.driver_number)
        );
      }

      // Apply lap number limit client-side
      filtered = filtered.filter((lap) => lap.lap_number <= limit);

      return filtered;
    } catch (error) {
      console.error("❌ Failed to fetch laps:", error);
      return [];
    }
  },

  async getIntervals(sessionKey: number): Promise<IntervalData[]> {
    return fetchWithFallback<IntervalData[]>("intervals", {
      session_key: sessionKey,
    });
  },

  async getStints(sessionKey: number): Promise<StintData[]> {
    return fetchWithFallback<StintData[]>("stints", {
      session_key: sessionKey,
    });
  },

  async getRaceMeetings(params: QueryParams): Promise<RaceMeeting[]> {
    return fetchWithFallback<RaceMeeting[]>("meetings", params);
  },

  async getSessionResults(sessionKey: number): Promise<SessionResultData[]> {
    return fetchWithFallback<SessionResultData[]>("session_result", {
      session_key: sessionKey,
    });
  },

  async getDriverSessionResults(
    driverNumber: number
  ): Promise<SessionResultData[]> {
    return fetchWithFallback<SessionResultData[]>("session_result", {
      driver_number: driverNumber,
    });
  },
};
