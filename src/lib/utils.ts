import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(seconds?: number | null) {
  if (seconds === undefined || seconds === null) {
    return "--";
  }

  const totalMs = Math.round(seconds * 1000);
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  return `${mins}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
}

export function formatInterval(seconds?: number | string | null) {
  if (seconds === undefined || seconds === null) return "--";
  if (typeof seconds === "string") return seconds;
  const sign = seconds > 0 ? "+" : "";
  return `${sign}${seconds.toFixed(3)}s`;
}

export function formatSeconds(seconds?: number | null) {
  if (seconds === undefined || seconds === null) return "--";
  return `${seconds.toFixed(3)}s`;
}
