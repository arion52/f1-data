"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/live", label: "🏁 Live" },
  { href: "/archive", label: "📅 Archive" },
  { href: "/settings", label: "⚙️ Settings", disabled: true },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-white/80">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/80 to-rose-500/80 text-base font-semibold shadow-lg shadow-rose-500/20">
              F1
            </span>
            <span className="hidden text-xs text-white/60 sm:inline">
              Telemetry Insight Hub
            </span>
          </div>
          <ul className="flex items-center gap-1 rounded-full bg-white/5 p-1 text-sm text-white/70">
            {NAV_ITEMS.map(({ href, label, disabled }) => {
              const isActive =
                pathname === href ||
                pathname?.startsWith(`${href}/`) ||
                (href === "/live" &&
                  (pathname === "/" || pathname?.startsWith("/live")));
              return (
                <li key={href}>
                  {disabled ? (
                    <span
                      aria-disabled="true"
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/30"
                    >
                      {label}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        "relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none",
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-400"
                      )}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 24,
                          }}
                        />
                      ) : null}
                      <span className="relative z-10">{label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(248,113,113,0.25),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.18),transparent_45%)]" />
        <AnimatePresence mode="wait">
          <motion.section
            key={pathname}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14"
          >
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
      <footer className="border-t border-white/5 bg-black/60 py-6 text-center text-xs text-white/40">
        Data courtesy of OpenF1 • Built for race strategists & fans alike
      </footer>
    </div>
  );
}
