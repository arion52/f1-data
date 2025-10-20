"use client";

import { LapDetail } from "@/hooks/useLiveTelemetry";
import { getDriverColor, getTyreColor } from "@/lib/colors";
import { Driver } from "@/lib/openf1";
import { formatSeconds, formatTime } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

interface LiveTelemetryChartProps {
  data: Array<Record<string, number | undefined>>;
  drivers: Driver[];
  detailMap: Map<string, LapDetail>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  statusLabel?: string;
  footnote?: string;
}

export function LiveTelemetryChart({
  data,
  drivers,
  detailMap,
  isLoading,
  title = "Live Telemetry",
  subtitle = "Speed vs Lap",
  statusLabel,
  footnote,
}: LiveTelemetryChartProps) {
  const [activeLap, setActiveLap] = useState<number | null>(null);

  const chartLines = useMemo(
    () =>
      drivers.map((driver) => ({
        driver,
        stroke: getDriverColor(driver),
      })),
    [drivers]
  );

  const renderTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    const lap = Number(label ?? 0);
    return (
      <div className="min-w-[220px] rounded-xl border border-white/10 bg-black/80 p-3 text-xs text-white/80 shadow-xl">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-white/50">
          <span>Lap</span>
          <span className="text-white/70">{lap}</span>
        </div>
        <div className="flex flex-col gap-2">
          {payload.map((item) => {
            const driver = drivers.find(
              (entry) =>
                String(entry.driver_number) === String(item?.dataKey ?? "")
            );
            if (!driver) return null;
            const detail = detailMap.get(`${driver.driver_number}-${lap}`);
            return (
              <div
                key={driver.driver_number}
                className="flex flex-col gap-1 rounded-lg bg-white/5 p-2"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-white">
                  <span className="flex items-center gap-2">
                    <span
                      className="block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getDriverColor(driver) }}
                      aria-hidden
                    />
                    {driver.broadcast_name}
                  </span>
                  <span className="text-white/70">
                    {Math.round(item?.value ?? 0)} km/h
                  </span>
                </div>
                {detail ? (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
                    <span>Tyre</span>
                    <span className="flex items-center gap-2 justify-end">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: getTyreColor(detail.compound),
                        }}
                      />
                      {detail.compound ?? "--"}
                    </span>
                    <span>Lap Time</span>
                    <span className="text-right">
                      {formatTime(detail.lapTime)}
                    </span>
                    <span>Sectors</span>
                    <span className="text-right">{`${formatSeconds(
                      detail.sectors?.s1
                    )} / ${formatSeconds(detail.sectors?.s2)} / ${formatSeconds(
                      detail.sectors?.s3
                    )}`}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-[320px] w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            {title}
          </p>
          <h2 className="text-lg font-semibold text-white">{subtitle}</h2>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
          {statusLabel ?? (isLoading ? "Refreshing…" : "Updated")}
        </span>
      </div>
      <div className="relative flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseMove={(state) => {
              if (state && state.activeLabel)
                setActiveLap(Number(state.activeLabel));
            }}
            onMouseLeave={() => setActiveLap(null)}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="lap"
              stroke="#e5e7eb"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#e5e7eb"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              domain={[200, "auto"]}
            />
            <Tooltip
              cursor={{ stroke: "rgba(148,163,184,0.4)", strokeWidth: 1 }}
              content={renderTooltip}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend
              formatter={(value, entry) => {
                const payload = entry as { dataKey?: string };
                const driver = drivers.find(
                  (item) =>
                    String(item.driver_number) === String(payload.dataKey ?? "")
                );
                return driver ? driver.name_acronym : value;
              }}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: 12,
                color: "rgba(255,255,255,0.65)",
                fontSize: 12,
              }}
            />
            {chartLines.map(({ driver, stroke }) => (
              <Line
                key={driver.driver_number}
                type="monotone"
                dataKey={String(driver.driver_number)}
                name={driver.name_acronym}
                stroke={stroke}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-[11px] text-white/50">
        <span>
          {activeLap
            ? `Focusing lap ${activeLap}`
            : "Hover or tap to inspect a lap"}
        </span>
        <span>{footnote ?? "Data source: OpenF1"}</span>
      </div>
    </div>
  );
}
