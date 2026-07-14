"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, EyeOff, FileDown, ChevronDown } from "lucide-react";
import HeroVisual2D from "@/components/landing/HeroVisual2D";
import { EASE_OUT } from "@/components/landing/motion";

// The three.js bundle only downloads when a capable device actually renders
// the 3D scene; ssr:false keeps it out of the server render entirely.
const HeroScene = dynamic(() => import("@/components/landing/HeroScene"), { ssr: false });

type HeroMode = "pending" | "3d" | "2d";

/**
 * Decide once, on the client, whether this device gets the 3D hero or the
 * lightweight 2D fallback. Anything that hints at a phone, a low-power
 * machine, data saver, reduced motion, or missing WebGL gets the 2D version;
 * the page must never feel slow. `?hero=3d|2d` overrides for testing.
 */
function decideHeroMode(): HeroMode {
  const override = new URLSearchParams(window.location.search).get("hero");
  if (override === "3d") return "3d";
  if (override === "2d") return "2d";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "2d";
  if (window.matchMedia("(pointer: coarse)").matches) return "2d";
  if (window.innerWidth < 1024) return "2d";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return "2d";
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 3) return "2d";
  if (nav.connection?.saveData) return "2d";

  try {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) return "2d";
  } catch {
    return "2d";
  }

  return "3d";
}

function useHeroActive(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [docVisible, setDocVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);

    const onVisibility = () => setDocVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);

  return inView && docVisible;
}

function MagneticCta() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22 });
  const springY = useSpring(y, { stiffness: 260, damping: 22 });

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.14);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-block"
    >
      <Link
        href="/signup"
        className="btn-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-8 py-4 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_28px_-4px_rgba(201,168,76,0.6)] transition-shadow duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_40px_-4px_rgba(201,168,76,0.75)]"
      >
        Get Started Free
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}

const HEADLINE_LINE1 = ["Turn", "any", "GeM", "tender"];
const HEADLINE_LINE2 = ["into", "a"];
const HEADLINE_GOLD = ["finished", "bid"];

const wordVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT, delay: 0.12 + i * 0.055 },
  }),
};

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<HeroMode>("pending");
  const [mount3d, setMount3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const active = useHeroActive(heroRef);

  useEffect(() => {
    setMode(decideHeroMode());
  }, []);

  // Defer the three.js chunk until the browser is idle so it can never
  // compete with first paint.
  useEffect(() => {
    if (mode !== "3d") return;
    const start = () => setMount3d(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1600 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 400);
    return () => clearTimeout(id);
  }, [mode]);

  const handleFallback = () => {
    setReady3d(false);
    setMode("2d");
  };

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      {/* backdrop layers */}
      <div className="bg-grid-gold pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-navy-light/40 blur-[90px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-14 lg:min-h-[calc(100vh-73px)] lg:grid-cols-[1.02fr_1fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-6">
        {/* copy */}
        <div className="relative z-10 flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold shadow-[0_0_24px_-8px_rgba(201,168,76,0.4)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI bid drafting for GeM tenders
          </motion.div>

          <h1 className="mt-7 max-w-2xl text-[2.6rem] font-bold leading-[1.08] tracking-[-0.02em] text-white text-balance sm:text-6xl xl:text-[4rem]">
            {HEADLINE_LINE1.map((word, i) => (
              <motion.span
                key={word + i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="mr-[0.24em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            {HEADLINE_LINE2.map((word, i) => (
              <motion.span
                key={word + i}
                custom={HEADLINE_LINE1.length + i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="mr-[0.24em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            {HEADLINE_GOLD.map((word, i) => (
              <motion.span
                key={word}
                custom={HEADLINE_LINE1.length + HEADLINE_LINE2.length + i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="text-gradient-gold mr-[0.24em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            Upload the tender PDF. TenderDraft reads every requirement, drafts all 13
            sections from your company&apos;s real facts, and hands you a polished Word
            document in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.62 }}
            className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <MagneticCta />
            <Link
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-gold/40 hover:bg-gold/5"
            >
              See how it works
              <ChevronDown className="h-4 w-4 text-white/50 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-gold" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-white/45"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold/70" />
              DPDP Act 2023 aligned
            </span>
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5 text-gold/70" />
              Never used to train AI
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileDown className="h-3.5 w-3.5 text-gold/70" />
              Word export in one click
            </span>
          </motion.div>
        </div>

        {/* visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.35 }}
          className="relative mx-auto w-full max-w-[560px] lg:max-w-[620px]"
          aria-hidden
        >
          <HeroVisual2D
            className={`transition-opacity duration-700 ${ready3d ? "opacity-0" : "opacity-100"}`}
          />
          {mode === "3d" && mount3d && (
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                ready3d ? "opacity-100" : "opacity-0"
              }`}
            >
              <HeroScene active={active} onReady={() => setReady3d(true)} onFallback={handleFallback} />
            </div>
          )}
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        aria-hidden
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-gold"
            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
