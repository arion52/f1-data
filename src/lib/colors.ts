import type { Driver } from "./openf1";

export function getDriverColor(driver: Driver): string {
  if (driver.team_colour) {
    return `#${driver.team_colour}`;
  }
  const palette = [
    "#f87171",
    "#22d3ee",
    "#facc15",
    "#a855f7",
    "#34d399",
    "#f97316",
    "#60a5fa",
    "#fcd34d",
    "#fb7185",
    "#38bdf8",
    "#f472b6",
    "#4ade80",
    "#c084fc",
    "#fbbf24",
    "#ef4444",
  ];
  const index = driver.driver_number % palette.length;
  return palette[index];
}

export const TYRE_COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#ff4d6d",
  MEDIUM: "#f5b301",
  HARD: "#9ca3af",
  INTERMEDIATE: "#22c55e",
  WET: "#0ea5e9",
};

export function getTyreColor(compound?: string | null) {
  if (!compound) return "#6b7280";
  return TYRE_COMPOUND_COLORS[compound.toUpperCase()] ?? "#6b7280";
}
