"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Pure CSS/Framer version of the hero visual: tender pages flowing through a
 * gold ring and emerging as a polished proposal. Shown on mobile and
 * low-power devices instead of the 3D scene, and underneath the 3D canvas
 * while it lazy-loads. All animation is transform/opacity only.
 */
export default function HeroVisual2D({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={`relative aspect-square w-full select-none ${className}`} aria-hidden>
      {/* ambient orbs */}
      <div className="absolute left-[8%] top-[12%] h-2/5 w-2/5 rounded-full bg-gold/15 blur-[70px]" />
      <div className="absolute bottom-[6%] right-[4%] h-1/3 w-1/3 rounded-full bg-navy-light/50 blur-[60px]" />

      {/* portal ring */}
      <div className="absolute left-[30%] top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2">
        {/* rotating conic glow, masked into a ring */}
        <div
          className="ring-conic absolute inset-[-14%] rounded-full opacity-70"
          style={{
            WebkitMaskImage: "radial-gradient(circle, transparent 52%, black 62%, black 72%, transparent 82%)",
            maskImage: "radial-gradient(circle, transparent 52%, black 62%, black 72%, transparent 82%)",
          }}
        />
        <div className="absolute inset-0 rounded-full border border-gold/60 shadow-[0_0_60px_-10px_rgba(201,168,76,0.5),inset_0_0_40px_-16px_rgba(201,168,76,0.45)]" />
        <div className="absolute inset-[10%] rounded-full border border-gold/15" />
        {/* periodic absorb pulse */}
        {!reduced && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gold/50"
            animate={{ scale: [0.72, 1.1], opacity: [0.55, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>

      {/* raw tender pages flowing into the ring */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-[2%] top-[14%] w-[17%] rounded-md border border-white/30 bg-white/[0.13] p-[4%]"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
            animate={{
              x: [0, 95, 200],
              y: [0, 55, 120],
              scale: [0.95, 0.8, 0.4],
              rotate: [-9, -3, 5],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5.2,
              times: [0, 0.55, 1],
              repeat: Infinity,
              delay: i * 1.75,
              ease: "easeInOut",
            }}
          >
            <div className="h-1 w-3/5 rounded-full bg-white/70" />
            <div className="mt-1.5 h-0.5 w-full rounded-full bg-white/40" />
            <div className="mt-1 h-0.5 w-5/6 rounded-full bg-white/40" />
            <div className="mt-1 h-0.5 w-full rounded-full bg-white/40" />
            <div className="mt-1 h-0.5 w-2/3 rounded-full bg-white/40" />
          </motion.div>
        ))}

      {/* finished proposal document */}
      <motion.div
        className="shimmer-gold absolute right-[2%] top-[15%] w-[44%] rotate-[5deg] rounded-xl p-[4.5%]"
        style={{
          background: "linear-gradient(160deg, #f9f5ea 0%, #efe7d2 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 60px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.35), 0 0 80px -24px rgba(201,168,76,0.5)",
        }}
        animate={reduced ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* gold header band */}
        <div className="h-[7%] min-h-2 w-full rounded-sm bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        {/* title */}
        <div className="mt-[6%] h-[4.5%] min-h-1.5 w-4/5 rounded-full bg-navy/85" />
        <div className="mt-[3%] h-[2.5%] min-h-1 w-1/2 rounded-full bg-navy/30" />
        {/* body lines */}
        <div className="mt-[7%] space-y-[3.5%]">
          <div className="h-[2.5%] min-h-1 w-full rounded-full bg-navy/20" />
          <div className="h-[2.5%] min-h-1 w-[92%] rounded-full bg-navy/20" />
          <div className="h-[2.5%] min-h-1 w-full rounded-full bg-navy/20" />
          <div className="h-[2.5%] min-h-1 w-[70%] rounded-full bg-navy/20" />
        </div>
        {/* compliance table */}
        <div className="mt-[7%] overflow-hidden rounded-md border border-navy/20">
          <div className="grid grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 border-navy/15 ${i < 3 ? "bg-navy/85" : "bg-transparent"} ${
                  i % 3 !== 2 ? "border-r" : ""
                } ${i < 3 ? "border-b" : ""}`}
              />
            ))}
          </div>
        </div>
        {/* footer: lines + gold seal */}
        <div className="mt-[7%] flex items-end justify-between">
          <div className="w-1/2 space-y-[8%]">
            <div className="h-1 w-full rounded-full bg-navy/20" />
            <div className="mt-1 h-1 w-2/3 rounded-full bg-navy/20" />
          </div>
          <div className="relative h-9 w-9 shrink-0 rounded-full border-2 border-gold bg-gold/15 shadow-[0_0_20px_-4px_rgba(201,168,76,0.7)] sm:h-11 sm:w-11">
            <div className="absolute inset-[22%] rounded-full border border-gold/70" />
          </div>
        </div>
      </motion.div>

      {/* ambient gold dots */}
      {[
        { left: "12%", top: "68%", d: "5.4s", del: "0s", s: "5px" },
        { left: "22%", top: "26%", d: "6.8s", del: "0.8s", s: "4px" },
        { left: "48%", top: "80%", d: "6.1s", del: "1.6s", s: "6px" },
        { left: "58%", top: "10%", d: "7.2s", del: "0.4s", s: "4px" },
        { left: "80%", top: "70%", d: "5.8s", del: "2.2s", s: "5px" },
        { left: "88%", top: "34%", d: "6.5s", del: "1.1s", s: "4px" },
        { left: "38%", top: "44%", d: "7s", del: "2.8s", s: "3px" },
      ].map((dot, i) => (
        <span
          key={i}
          className="landing-dot absolute rounded-full bg-gold/70 blur-[0.5px]"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.s,
            height: dot.s,
            animationDuration: dot.d,
            animationDelay: dot.del,
          }}
        />
      ))}
    </div>
  );
}
