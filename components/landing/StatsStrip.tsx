"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/components/landing/motion";

const STATS = [
  { value: "13", label: "structured bid sections" },
  { value: "0", label: "invented facts, ever" },
  { value: "2 min", label: "one-time company setup" },
  { value: "1 click", label: "Word document export" },
];

export default function StatsStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.08 }}
            className={`flex flex-col items-center gap-1.5 px-6 py-10 text-center ${
              i > 0 ? "border-l border-white/[0.06]" : ""
            } ${i === 2 ? "max-lg:border-l-0 max-lg:border-t" : ""} ${i === 3 ? "max-lg:border-t" : ""}`}
          >
            <span className="text-gradient-gold text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</span>
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/40">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
