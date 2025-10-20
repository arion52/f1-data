import { LiveDashboard } from "@/components/live/LiveDashboard";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-white/60">Loading live dashboard…</div>
      }
    >
      <LiveDashboard />
    </Suspense>
  );
}
