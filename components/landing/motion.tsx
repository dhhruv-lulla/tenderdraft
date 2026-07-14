"use client";

import { motion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Wraps the whole landing page so every framer-motion animation inside
 * automatically respects the visitor's OS-level reduced-motion setting
 * (transforms are skipped, opacity still fades). Individual components
 * don't need their own useReducedMotion plumbing for the common case.
 */
export function LandingShell({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "center",
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  return (
    <FadeIn className={`flex max-w-2xl flex-col ${alignClass}`}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">
        <span className="h-px w-6 bg-gold/50" aria-hidden />
        {kicker}
        {align === "center" && <span className="h-px w-6 bg-gold/50" aria-hidden />}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-white/55">{sub}</p>}
    </FadeIn>
  );
}
