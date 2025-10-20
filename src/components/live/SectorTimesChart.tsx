"use client";

import { getDriverColor } from "@/lib/colors";
import { Driver } from "@/lib/openf1";
import { formatSeconds } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

interface SectorData {
  sector: string;
  [key: string]: number | string;
}

interface SectorTimesChartProps {
  data: SectorData[];
  drivers: Driver[];
  isLoading?: boolean;
}

export function SectorTimesChart({
  data,
  drivers,
  isLoading,
}: SectorTimesChartProps) {
  // Debug logging
  console.log("🔍 SectorTimesChart - Data:", data);
  console.log("🔍 SectorTimesChart - Drivers:", drivers);
  console.log("🔍 SectorTimesChart - Data length:", data.length);
  console.log("🔍 SectorTimesChart - Drivers length:", drivers.length);

  // Check if there's actually any sector data
  const hasData = data.some((sector) => {
    return drivers.some((driver) => sector[driver.driver_number] !== undefined);
  });

  console.log("🔍 SectorTimesChart - Has actual data:", hasData);

  const renderTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    return (
      <div className="min-w-[200px] rounded-xl border border-white/10 bg-black/80 p-3 text-xs text-white/80 shadow-xl">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">
          {label}
        </div>
        <div className="flex flex-col gap-2">
          {payload.map((item) => {
            const driver = drivers.find(
              (d) => String(d.driver_number) === String(item?.dataKey ?? "")
            );
            if (!driver) return null;
            return (
              <div
                key={driver.driver_number}
                className="flex items-center justify-between gap-4"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getDriverColor(driver) }}
                    aria-hidden
                  />
                  {driver.name_acronym}
                </span>
                <span className="font-semibold text-white">
                  {formatSeconds(item?.value as number | undefined)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-[400px] w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-black/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Sector Analysis
          </p>
          <h2 className="text-lg font-semibold text-white">
            Best sector times
          </h2>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">
          {isLoading ? "Updating…" : "Seconds"}
        </span>
      </div>
      <div
        className="relative flex-1 min-h-[250px]"
        style={{ minHeight: "250px" }}
      >
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-xs text-white/40">
            No sector data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="sector"
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
                tickFormatter={(value) => `${value.toFixed(1)}s`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={renderTooltip}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend
                formatter={(value) => {
                  const driver = drivers.find(
                    (d) => String(d.driver_number) === String(value)
                  );
                  return driver ? driver.name_acronym : value;
                }}
                iconType="square"
                iconSize={10}
                wrapperStyle={{
                  paddingTop: 12,
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 12,
                }}
              />
              {drivers.map((driver) => (
                <Bar
                  key={driver.driver_number}
                  dataKey={String(driver.driver_number)}
                  name={driver.name_acronym}
                  fill={getDriverColor(driver)}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-[11px] text-white/50">
        <span>Fastest times per sector</span>
        <span>Data source: OpenF1</span>
      </div>
    </div>
  );
}
