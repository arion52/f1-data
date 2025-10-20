"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const NAV_LINKS = [
  { href: "/live", label: "🏁 Live" },
  { href: "/archive", label: "📅 Archive" },
  { href: "/settings", label: "⚙️ Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  const activeHref = useMemo(() => {
    if (!pathname) return "/live";
    const candidate = NAV_LINKS.find((link) => pathname.startsWith(link.href));
    return candidate?.href ?? "/live";
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 backdrop-blur border border-white/5 rounded-full bg-black/40 px-2 py-1"
    >
      <ul className="flex items-center gap-1 text-sm font-medium">
        {NAV_LINKS.map((link) => {
          const isActive = activeHref === link.href;
          return (
            <li key={link.href} className="relative isolate">
              {isActive ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10 shadow-[0_0_20px_rgba(248,113,113,0.35)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              ) : null}
              <Link
                href={link.href}
                className={clsx(
                  "relative block rounded-full px-4 py-2 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-neutral-300 hover:text-white focus-visible:outline-amber-400"
                )}
              >
                <span className="sr-only">
                  Go to {link.label.replace(/^[^\s]+\s/, "")}
                </span>
                <span aria-hidden>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
