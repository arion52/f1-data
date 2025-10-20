import { LiveStatsView } from "@/components/live/LiveStatsView";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-white/60">Loading statistics…</div>
      }
    >
      <LiveStatsView />
    </Suspense>
  );
}
