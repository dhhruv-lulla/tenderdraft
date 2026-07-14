"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerformanceMonitor, RoundedBox } from "@react-three/drei";

/**
 * The 3D hero: raw tender pages flow along a curve, pass through a glowing
 * gold ring (the "engine"), and a finished, structured proposal document
 * floats on the other side. Everything is procedural - canvas-drawn textures
 * and plain lights - so the scene loads zero external assets.
 *
 * Performance contract:
 * - dpr capped at 1.75, dropped to 1 if the frame rate declines
 * - PerformanceMonitor calls onFallback if it keeps flip-flopping, letting
 *   the parent swap to the 2D visual entirely
 * - `active={false}` (hero offscreen / tab hidden) freezes the render loop
 */

const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e9c878";
const IVORY = "#f7f2e4";
const NAVY = "#12204a";

function useCanvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function drawGlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(233, 200, 120, 0.85)");
  g.addColorStop(0.35, "rgba(201, 168, 76, 0.28)");
  g.addColorStop(1, "rgba(201, 168, 76, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawRawPage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#eef0f6";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#565d75";
  ctx.fillRect(w * 0.12, h * 0.1, w * 0.5, h * 0.045);
  ctx.fillStyle = "#9aa0b4";
  const lineH = h * 0.022;
  for (let i = 0; i < 12; i++) {
    const y = h * 0.22 + i * h * 0.06;
    const width = w * (i % 3 === 2 ? 0.55 : 0.76);
    ctx.fillRect(w * 0.12, y, width, lineH);
  }
}

function drawProposal(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // ivory base
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#faf6ec");
  bg.addColorStop(1, "#efe7d1");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // gold border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // gold header band
  const band = ctx.createLinearGradient(0, 0, w, 0);
  band.addColorStop(0, "#a8863a");
  band.addColorStop(0.5, GOLD);
  band.addColorStop(1, "#ddc47c");
  ctx.fillStyle = band;
  ctx.fillRect(28, 30, w - 56, h * 0.055);

  // title + subtitle
  ctx.fillStyle = NAVY;
  ctx.fillRect(w * 0.08, h * 0.135, w * 0.66, h * 0.035);
  ctx.fillStyle = "rgba(18, 32, 74, 0.4)";
  ctx.fillRect(w * 0.08, h * 0.19, w * 0.4, h * 0.02);

  // body lines
  ctx.fillStyle = "rgba(18, 32, 74, 0.28)";
  const widths = [0.84, 0.78, 0.84, 0.6, 0, 0.84, 0.7, 0.82, 0.5];
  widths.forEach((frac, i) => {
    if (!frac) return;
    ctx.fillRect(w * 0.08, h * (0.26 + i * 0.035), w * frac, h * 0.016);
  });

  // compliance table
  const tx = w * 0.08;
  const ty = h * 0.62;
  const tw = w * 0.84;
  const th = h * 0.15;
  ctx.fillStyle = NAVY;
  ctx.fillRect(tx, ty, tw, th / 3);
  ctx.strokeStyle = "rgba(18, 32, 74, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(tx, ty, tw, th);
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(tx + (tw / 3) * i, ty);
    ctx.lineTo(tx + (tw / 3) * i, ty + th);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(tx, ty + th / 3);
  ctx.lineTo(tx + tw, ty + th / 3);
  ctx.moveTo(tx, ty + (th / 3) * 2);
  ctx.lineTo(tx + tw, ty + (th / 3) * 2);
  ctx.stroke();

  // signature lines + gold seal
  ctx.fillStyle = "rgba(18, 32, 74, 0.3)";
  ctx.fillRect(w * 0.08, h * 0.86, w * 0.3, h * 0.014);
  ctx.fillRect(w * 0.08, h * 0.9, w * 0.2, h * 0.014);

  const sealX = w * 0.8;
  const sealY = h * 0.87;
  const sealR = w * 0.085;
  const sealGrad = ctx.createRadialGradient(sealX, sealY, sealR * 0.2, sealX, sealY, sealR);
  sealGrad.addColorStop(0, GOLD_LIGHT);
  sealGrad.addColorStop(1, "#a8863a");
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a6d2c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR * 0.62, 0, Math.PI * 2);
  ctx.stroke();
}

/* ------------------------------------------------------------------ */

function SceneRig({ onReady, children }: { onReady: () => void; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const frames = useRef(0);
  const readySent = useRef(false);

  useFrame((state, delta) => {
    if (!readySent.current && frames.current++ > 2) {
      readySent.current = true;
      onReady();
    }
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.1, 3, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.06, 3, delta);
    }
  });

  return <group ref={group}>{children}</group>;
}

function PortalRing() {
  const ring = useRef<THREE.Mesh>(null);
  const glowTex = useCanvasTexture(drawGlow, 256, 256);

  useFrame((state) => {
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * 1.6) * 0.45;
      ring.current.rotation.z = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group position={[0, 0.1, 0]} rotation={[0.06, 0.5, 0]}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.22, 0.02, 24, 128]} />
        <meshStandardMaterial color={GOLD} emissive={new THREE.Color(GOLD)} emissiveIntensity={1.5} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.38, 0.006, 12, 96]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={new THREE.Color(GOLD)}
          emissiveIntensity={0.7}
          transparent
          opacity={0.45}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

const PAGE_COUNT = 5;

function FlowPages() {
  const pageTex = useCanvasTexture(drawRawPage, 192, 256);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.6, 1.7, -2.2),
        new THREE.Vector3(-2.2, 0.95, -1.1),
        new THREE.Vector3(-0.7, 0.3, -0.2),
        new THREE.Vector3(0.35, 0.08, 0.25),
        new THREE.Vector3(1.15, -0.05, 0.55),
      ]),
    []
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t0 = state.clock.elapsedTime * 0.085;
    for (let i = 0; i < PAGE_COUNT; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      const t = (t0 + i / PAGE_COUNT) % 1;
      curve.getPointAt(t, tmp);
      mesh.position.copy(tmp);
      const s = 0.85 - t * 0.5;
      mesh.scale.setScalar(s);
      mesh.rotation.y = -0.55 + t * 0.45;
      mesh.rotation.z = Math.sin(t * Math.PI) * -0.14;
      mesh.rotation.x = Math.sin(state.clock.elapsedTime * 1.8 + i * 2.1) * 0.05;
      const fadeIn = THREE.MathUtils.smoothstep(t, 0.0, 0.1);
      const fadeOut = 1 - THREE.MathUtils.smoothstep(t, 0.78, 0.97);
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(fadeIn, fadeOut) * 0.95;
    }
  });

  return (
    <>
      {Array.from({ length: PAGE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <planeGeometry args={[0.72, 0.96]} />
          <meshBasicMaterial map={pageTex} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function ProposalDoc() {
  const faceTex = useCanvasTexture(drawProposal, 512, 688);
  const seal = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (seal.current) {
      const mat = seal.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + Math.max(0, Math.sin(state.clock.elapsedTime * 1.4)) * 0.9;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.16} floatIntensity={0.55} floatingRange={[-0.08, 0.08]}>
      <group position={[1.28, -0.08, 0.7]} rotation={[0.02, -0.5, 0.02]}>
        <RoundedBox args={[1.68, 2.26, 0.07]} radius={0.035} smoothness={3}>
          <meshStandardMaterial color={IVORY} roughness={0.55} metalness={0.02} />
        </RoundedBox>
        <mesh position={[0, 0, 0.041]}>
          <planeGeometry args={[1.6, 2.18]} />
          <meshBasicMaterial map={faceTex} toneMapped={false} />
        </mesh>
        {/* raised gold seal; cylinder axis is Y, so tilt it to face the camera */}
        <mesh ref={seal} position={[0.48, -0.83, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.015, 32]} />
          <meshStandardMaterial color={GOLD} emissive={new THREE.Color(GOLD)} emissiveIntensity={0.8} roughness={0.35} metalness={0.75} />
        </mesh>
      </group>
    </Float>
  );
}

function GoldParticles({ count }: { count: number }) {
  const group = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(theta) * r - 1.2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.02;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={GOLD_LIGHT}
        transparent
        opacity={0.65}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */

export default function HeroScene({
  active,
  onReady,
  onFallback,
}: {
  active: boolean;
  onReady: () => void;
  onFallback: () => void;
}) {
  const [degraded, setDegraded] = useState(false);

  return (
    <Canvas
      aria-hidden
      dpr={degraded ? 1 : [1, 1.75]}
      camera={{ position: [0, 0.15, 7], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      frameloop={active ? "always" : "never"}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFallback();
        });
      }}
    >
      <PerformanceMonitor
        bounds={(refreshRate) => [40, Math.min(75, refreshRate)]}
        flipflops={2}
        onDecline={() => setDegraded(true)}
        onFallback={onFallback}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 6]} intensity={1.2} />
        <pointLight position={[-3, -1.5, 3]} intensity={16} color={GOLD} distance={14} decay={2} />
        <SceneRig onReady={onReady}>
          <PortalRing />
          <FlowPages />
          <ProposalDoc />
          <GoldParticles count={degraded ? 70 : 200} />
        </SceneRig>
      </PerformanceMonitor>
    </Canvas>
  );
}
