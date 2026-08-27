import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  ChevronDown, Upload, RotateCcw, RotateCw, ZoomIn, ZoomOut,
  ShoppingCart, Eye, Instagram, MessageCircle, Mail,
  ArrowRight, Trash2, Send, ChevronRight, Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
interface ArtworkState {
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

type ShirtColorKey = "black" | "white" | "beige" | "gray" | "navy";

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────
const SHIRT_COLORS: Record<ShirtColorKey, string> = {
  black: "#101010",
  white: "#ece9e3",
  beige: "#c4a882",
  gray: "#6e6e6e",
  navy: "#192240",
};

const COLOR_LABELS: Record<ShirtColorKey, string> = {
  black: "Negro",
  white: "Blanco",
  beige: "Arena",
  gray: "Gris",
  navy: "Marino",
};

const SHIRT_PATH =
  "M200,64 C168,64 138,52 116,30 L58,58 L8,92 L46,162 L88,144 L88,422 L312,422 L312,144 L354,162 L392,92 L342,58 L284,30 C262,52 232,64 200,64Z";
const COLLAR_PATH =
  "M166,64 C173,80 186,90 200,90 C214,90 227,80 234,64";

// ─────────────────────────────────────────────────────────────────────
// Glass style helper
// ─────────────────────────────────────────────────────────────────────
const glassStyle = (primary = false): React.CSSProperties => ({
  background: primary
    ? "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.09) 100%)"
    : "rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "999px",
  boxShadow: primary
    ? "0 4px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)"
    : "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
});

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "24px",
};

// ─────────────────────────────────────────────────────────────────────
// Star Field
// ─────────────────────────────────────────────────────────────────────
const StarField = () => {
  const stars = useRef(
    Array.from({ length: 130 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.3,
      delay: Math.random() * 5,
      dur: 2.5 + Math.random() * 3.5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.current.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0,
            animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// T-Shirt SVG Component
// ─────────────────────────────────────────────────────────────────────
const TShirt = ({
  color,
  children,
  className = "",
  id = "main",
}: {
  color: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <svg viewBox="0 0 400 460" className={className}>
    <defs>
      <clipPath id={`shirt-clip-${id}`}>
        <path d={SHIRT_PATH} />
      </clipPath>
      <radialGradient id={`shirt-hl-${id}`} cx="32%" cy="22%" r="65%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <radialGradient id={`shirt-shadow-${id}`} cx="50%" cy="100%" r="60%">
        <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <filter id={`drop-${id}`} x="-25%" y="-15%" width="150%" height="145%">
        <feDropShadow dx="0" dy="14" stdDeviation="22" floodColor="rgba(0,0,0,0.65)" />
      </filter>
    </defs>
    <g filter={`url(#drop-${id})`}>
      <path d={SHIRT_PATH} fill={color} />
    </g>
    <path d={SHIRT_PATH} fill={`url(#shirt-hl-${id})`} />
    <path d={SHIRT_PATH} fill={`url(#shirt-shadow-${id})`} />
    <path
      d={COLLAR_PATH}
      fill="none"
      stroke="rgba(255,255,255,0.11)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="88" y1="188" x2="88" y2="422"
      stroke="rgba(0,0,0,0.18)" strokeWidth="1"
    />
    <line
      x1="312" y1="188" x2="312" y2="422"
      stroke="rgba(0,0,0,0.18)" strokeWidth="1"
    />
    <g clipPath={`url(#shirt-clip-${id})`}>{children}</g>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────
// Space Print (After state)
// ─────────────────────────────────────────────────────────────────────
const SpacePrint = () => (
  <g>
    <defs>
      <radialGradient id="planet-radial" cx="36%" cy="32%" r="64%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
      </radialGradient>
    </defs>
    <g transform="translate(200, 228)">
      {/* Outer ambient ring */}
      <circle cx="0" cy="0" r="104" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
      {/* Scattered stars */}
      {[
        [-78, -62, 2], [70, -50, 1.3], [-54, 74, 1.8], [80, 60, 1.2],
        [-90, 16, 1.5], [85, -74, 2], [-34, -90, 1.4], [44, 84, 1.6],
        [-80, -34, 1], [60, -80, 2.2], [92, 28, 1.2], [-92, 48, 1.4],
      ].map(([sx, sy, sr], i) => (
        <circle
          key={i}
          cx={sx}
          cy={sy}
          r={sr}
          fill="white"
          opacity={0.45 + i * 0.04}
        />
      ))}
      {/* Planet body */}
      <circle
        cx="0" cy="0" r="58"
        fill="url(#planet-radial)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      {/* Surface band */}
      <ellipse cx="0" cy="-8" rx="42" ry="9" fill="rgba(255,255,255,0.05)" />
      {/* Uranus-style near-vertical rings */}
      <ellipse
        cx="0" cy="0" rx="15" ry="96"
        fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"
        transform="rotate(8)"
      />
      <ellipse
        cx="0" cy="0" rx="12" ry="83"
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
        transform="rotate(8)"
      />
      <ellipse
        cx="0" cy="0" rx="19" ry="110"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"
        transform="rotate(8)"
      />
      {/* Wordmark */}
      <text
        x="0" y="90"
        textAnchor="middle"
        fill="rgba(255,255,255,0.55)"
        fontSize="8"
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="600"
        letterSpacing="9"
      >
        URANO
      </text>
    </g>
  </g>
);

// ─────────────────────────────────────────────────────────────────────
// Before / After Slider (Hero)
// ─────────────────────────────────────────────────────────────────────
const BeforeAfterSlider = () => {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) update(e.clientX); };
    const onTouch = (e: TouchEvent) => { if (dragging.current) update(e.touches[0].clientX); };
    const onUp = () => { dragging.current = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouch);
      document.removeEventListener("touchend", onUp);
    };
  }, [update]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden cursor-col-resize"
      onMouseDown={(e) => { dragging.current = true; update(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; update(e.touches[0].clientX); }}
    >
      {/* AFTER layer (full) */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "12vh" }}>
        <TShirt color={SHIRT_COLORS.black} className="w-48 sm:w-64 md:w-72 lg:w-80 h-auto" id="hero-after">
          <SpacePrint />
        </TShirt>
      </div>

      {/* BEFORE layer (clipped left) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, paddingBottom: "12vh" }}
      >
        <TShirt color={SHIRT_COLORS.black} className="w-48 sm:w-64 md:w-72 lg:w-80 h-auto" id="hero-before" />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{ left: `${pos}%`, background: "rgba(255,255,255,0.45)" }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 z-10 pointer-events-none"
        style={{
          left: `${pos}%`,
          transform: "translate(-50%, calc(-50% - 6vh))",
        }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.11)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.38)",
            boxShadow: "0 0 0 5px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
            <path d="M5 1L1 6L5 11M13 1L17 6L13 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-10 left-8 text-xs tracking-[0.22em] uppercase text-white/40 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
        Antes
      </span>
      <span className="absolute bottom-10 right-8 text-xs tracking-[0.22em] uppercase text-white/40 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
        Después
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Scroll fade-in hook
// ─────────────────────────────────────────────────────────────────────
function useScrollFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goto = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-400"
      style={{
        background: scrolled ? "rgba(8,8,8,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-2.5"
      >
        <svg viewBox="0 0 28 28" className="w-7 h-7 flex-shrink-0">
          <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.92" />
          <ellipse cx="14" cy="14" rx="13" ry="4" fill="none" stroke="white" strokeWidth="1.4" opacity="0.65" transform="rotate(-28 14 14)" />
        </svg>
        <span className="text-white text-sm font-semibold tracking-[0.15em]" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}>
          URANO
        </span>
      </button>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {(["Personalizar", "Cotizar", "Tienda"] as const).map((label, i) => (
          <button
            key={label}
            onClick={() => goto(["customizer", "quote", "store"][i])}
            className="text-white/50 hover:text-white text-sm transition-colors duration-200"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => goto("quote")}
        className="text-sm font-medium px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ ...glassStyle(), borderRadius: "999px" }}
      >
        Cotizar ahora
      </button>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const goto = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#080808" }}
    >
      <StarField />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 58%, rgba(255,255,255,0.028) 0%, transparent 70%)",
        }}
      />

      {/* Slider canvas */}
      <div className="relative flex-1" style={{ minHeight: "68vh" }}>
        <BeforeAfterSlider />
      </div>

      {/* Hero copy */}
      <div className="relative z-10 pb-16 px-6 md:px-20 flex flex-col items-center text-center gap-5">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-6xl sm:text-8xl md:text-[7rem] font-black text-white leading-[0.92] tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Lo que imaginás,
            <br />
            <span className="text-white/38">existe.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/50 text-sm md:text-base max-w-md leading-relaxed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Diseñamos, estampamos y producimos prendas personalizadas
          para marcas, emprendimientos y personas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 pt-1"
        >
          <button
            onClick={() => goto("customizer")}
            className="px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={glassStyle(true)}
          >
            Personalizar mi remera
          </button>
          <button
            onClick={() => goto("quote")}
            className="px-8 py-3.5 text-sm font-medium text-white/75 transition-all duration-300 hover:text-white hover:scale-105 active:scale-95"
            style={glassStyle()}
          >
            Solicitar cotización
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/28">
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Customizer Section
// ─────────────────────────────────────────────────────────────────────
const CustomizerSection = ({
  onContinue,
}: {
  onContinue: (state: { color: ShirtColorKey; artwork: ArtworkState | null }) => void;
}) => {
  const { ref, visible } = useScrollFade();
  const [color, setColor] = useState<ShirtColorKey>("black");
  const [artwork, setArtwork] = useState<ArtworkState | null>(null);
  const artworkRef = useRef<ArtworkState | null>(null);
  artworkRef.current = artwork;

  const isDraggingArtwork = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingArtwork.current || !artworkRef.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setArtwork((prev) =>
        prev ? { ...prev, x: dragStart.current.px + dx, y: dragStart.current.py + dy } : null
      );
    };
    const onTouch = (e: TouchEvent) => {
      if (!isDraggingArtwork.current || !artworkRef.current) return;
      const dx = e.touches[0].clientX - dragStart.current.mx;
      const dy = e.touches[0].clientY - dragStart.current.my;
      setArtwork((prev) =>
        prev ? { ...prev, x: dragStart.current.px + dx, y: dragStart.current.py + dy } : null
      );
    };
    const onUp = () => { isDraggingArtwork.current = false; };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouch, { passive: false });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouch);
      document.removeEventListener("touchend", onUp);
    };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setArtwork({ url, x: 0, y: 0, scale: 1, rotation: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
    onContinue({ color, artwork });
  };

  const aw = artwork;
  const cx = 200 + (aw?.x ?? 0);
  const cy = 230 + (aw?.y ?? 0);
  const sc = aw?.scale ?? 1;
  const rot = aw?.rotation ?? 0;
  const halfW = 60 * sc;

  return (
    <section id="customizer" className="relative py-24 md:py-32" style={{ background: "#0a0a0a" }}>
      {/* Decorative ring */}
      <div
        className="absolute -top-48 right-0 w-96 h-96 rounded-full pointer-events-none opacity-[0.03]"
        style={{ border: "1px solid white", transform: "translateX(30%)" }}
      />

      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 md:px-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-white/35 text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            02 — Personalizar
          </p>
          <h2
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Diseñá tu remera
          </h2>
          <p
            className="text-white/38 mt-3 text-sm max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Subí tu diseño, posicionalo y personalizá cada detalle.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
          {/* Shirt canvas */}
          <div className="flex-1 flex flex-col items-center w-full">
            <div className="relative w-full max-w-xs mx-auto" style={{ aspectRatio: "400/460" }}>
              <TShirt color={SHIRT_COLORS[color]} className="w-full h-full" id="customizer">
                {aw && (
                  <image
                    href={aw.url}
                    x={cx - halfW}
                    y={cy - halfW}
                    width={halfW * 2}
                    height={halfW * 2}
                    transform={`rotate(${rot}, ${cx}, ${cy})`}
                    style={{ cursor: "move" }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      isDraggingArtwork.current = true;
                      dragStart.current = { mx: e.clientX, my: e.clientY, px: aw.x, py: aw.y };
                    }}
                    onTouchStart={(e) => {
                      isDraggingArtwork.current = true;
                      dragStart.current = {
                        mx: e.touches[0].clientX,
                        my: e.touches[0].clientY,
                        px: aw.x,
                        py: aw.y,
                      };
                    }}
                  />
                )}
              </TShirt>

              {/* Upload hint when empty */}
              {!aw && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ paddingTop: "26%" }}
                >
                  <button
                    className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl px-7 py-5 transition-all hover:bg-white/5"
                    style={{
                      border: "1px dashed rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 text-white/30" />
                    <span
                      className="text-white/35 text-xs"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Subir diseño
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Color dots */}
            <div className="flex items-center gap-3.5 mt-7">
              {(Object.keys(SHIRT_COLORS) as ShirtColorKey[]).map((c) => (
                <button
                  key={c}
                  title={COLOR_LABELS[c]}
                  onClick={() => setColor(c)}
                  className="rounded-full transition-all duration-250"
                  style={{
                    width: 26,
                    height: 26,
                    background: SHIRT_COLORS[c],
                    border: color === c ? "2px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.14)",
                    outline: color === c ? "2px solid rgba(255,255,255,0.18)" : "none",
                    outlineOffset: "3px",
                    transform: color === c ? "scale(1.18)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <p
              className="text-white/30 text-xs mt-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {COLOR_LABELS[color]}
            </p>
          </div>

          {/* Sidebar controls */}
          <div className="w-full lg:w-72 p-6 space-y-5 rounded-3xl" style={cardStyle}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            {/* Upload button */}
            <div>
              <p
                className="text-white/38 text-[10px] tracking-[0.22em] uppercase mb-3"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Diseño
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-95"
                style={glassStyle()}
              >
                <Upload className="w-4 h-4" />
                {aw ? "Cambiar diseño" : "Subir diseño"}
              </button>
            </div>

            {aw && (
              <>
                <div className="h-px" style={{ background: "rgba(255,255,255,0.055)" }} />

                {/* Scale */}
                <div>
                  <p
                    className="text-white/38 text-[10px] tracking-[0.22em] uppercase mb-3"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Tamaño
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setArtwork((p) => p ? { ...p, scale: Math.max(0.15, p.scale - 0.1) } : null)}
                      className="flex-1 py-2.5 rounded-2xl text-white transition-all hover:scale-105 active:scale-95 flex justify-center"
                      style={glassStyle()}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span
                      className="text-white/50 text-xs w-10 text-center"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {Math.round(aw.scale * 100)}%
                    </span>
                    <button
                      onClick={() => setArtwork((p) => p ? { ...p, scale: Math.min(3.2, p.scale + 0.1) } : null)}
                      className="flex-1 py-2.5 rounded-2xl text-white transition-all hover:scale-105 active:scale-95 flex justify-center"
                      style={glassStyle()}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <p
                    className="text-white/38 text-[10px] tracking-[0.22em] uppercase mb-3"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Rotación
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setArtwork((p) => p ? { ...p, rotation: p.rotation - 15 } : null)}
                      className="flex-1 py-2.5 rounded-2xl text-white transition-all hover:scale-105 active:scale-95 flex justify-center"
                      style={glassStyle()}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <span
                      className="text-white/50 text-xs w-10 text-center"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {aw.rotation}°
                    </span>
                    <button
                      onClick={() => setArtwork((p) => p ? { ...p, rotation: p.rotation + 15 } : null)}
                      className="flex-1 py-2.5 rounded-2xl text-white transition-all hover:scale-105 active:scale-95 flex justify-center"
                      style={glassStyle()}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-px" style={{ background: "rgba(255,255,255,0.055)" }} />

                {/* Reset */}
                <button
                  onClick={() => {
                    setArtwork(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/38 hover:text-white/60 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar diseño
                </button>
              </>
            )}

            {aw && (
              <p
                className="text-white/25 text-[11px] text-center leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Arrastrá el diseño sobre la prenda para reposicionarlo.
              </p>
            )}

            <div className="h-px" style={{ background: "rgba(255,255,255,0.055)" }} />

            <button
              onClick={handleContinue}
              className="w-full py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              style={glassStyle(true)}
            >
              Continuar con la cotización
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Quote Section
// ─────────────────────────────────────────────────────────────────────
const QuoteSection = ({
  design,
}: {
  design: { color: ShirtColorKey; artwork: ArtworkState | null } | null;
}) => {
  const { ref, visible } = useScrollFade();
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    prenda: "", cantidad: "", tecnica: "", comentarios: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls =
    "w-full bg-white/[0.04] text-white text-sm outline-none transition-all duration-200 px-4 py-3 rounded-xl placeholder-white/20 focus:bg-white/[0.07]";
  const inputStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.09)",
    fontFamily: "Inter, sans-serif",
  };
  const labelCls =
    "block text-[10px] tracking-[0.22em] uppercase text-white/38 mb-2";

  const aw = design?.artwork;
  const cx2 = 200 + (aw?.x ?? 0);
  const cy2 = 230 + (aw?.y ?? 0);
  const sc2 = aw?.scale ?? 1;
  const halfW2 = 60 * sc2;

  return (
    <section
      id="quote"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "#070707" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 35% 50% at 85% 50%, rgba(255,255,255,0.018) 0%, transparent 70%)",
        }}
      />

      <div
        ref={ref}
        className={`max-w-5xl mx-auto px-6 md:px-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-14">
          <p
            className="text-white/35 text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            03 — Cotizar
          </p>
          <h2
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Pedí tu presupuesto
          </h2>
          <p
            className="text-white/38 mt-3 text-sm"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Respondemos en menos de 24 horas.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={cardStyle}
            >
              <Check className="w-7 h-7 text-white" />
            </div>
            <h3
              className="text-4xl font-black text-white"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              ¡Solicitud enviada!
            </h3>
            <p
              className="text-white/45 text-sm text-center max-w-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Recibimos tu consulta. Nos ponemos en contacto a la brevedad.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Design preview */}
            <div
              className="lg:col-span-1 rounded-3xl p-6 flex flex-col items-center"
              style={cardStyle}
            >
              <span
                className={`${labelCls} self-start`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Tu diseño
              </span>
              <div className="w-36 mt-3">
                <TShirt
                  color={design ? SHIRT_COLORS[design.color] : SHIRT_COLORS.black}
                  className="w-full h-auto"
                  id="quote-preview"
                >
                  {aw && (
                    <image
                      href={aw.url}
                      x={cx2 - halfW2}
                      y={cy2 - halfW2}
                      width={halfW2 * 2}
                      height={halfW2 * 2}
                      transform={`rotate(${aw.rotation}, ${cx2}, ${cy2})`}
                    />
                  )}
                </TShirt>
              </div>
              <p
                className="text-white/30 text-xs mt-4 text-center leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {aw
                  ? "Diseño personalizado adjunto"
                  : "Sin diseño adjunto — podés describirlo en comentarios"}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+54 9 11 0000-0000"
                    value={form.telefono}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Ej: 50 unidades"
                    value={form.cantidad}
                    onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Tipo de prenda</label>
                  <select
                    required
                    value={form.prenda}
                    onChange={(e) => setForm((f) => ({ ...f, prenda: e.target.value }))}
                    className={inputCls}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="" disabled>Seleccioná...</option>
                    {["Remera", "Buzo", "Tote Bag", "Gorra", "Stickers", "Pack emprendimiento", "Otro"].map(
                      (p) => <option key={p} value={p}>{p}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Técnica de estampado</label>
                  <select
                    value={form.tecnica}
                    onChange={(e) => setForm((f) => ({ ...f, tecnica: e.target.value }))}
                    className={inputCls}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">No sé / A definir</option>
                    {["Serigrafía", "DTG (Digital)", "Transfer", "Vinilo", "Bordado", "Sublimación"].map(
                      (t) => <option key={t} value={t}>{t}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls} style={{ fontFamily: "Inter, sans-serif" }}>Comentarios</label>
                <textarea
                  rows={4}
                  placeholder="Contanos más sobre tu proyecto: colores, fechas, referencias..."
                  value={form.comentarios}
                  onChange={(e) => setForm((f) => ({ ...f, comentarios: e.target.value }))}
                  className={inputCls}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                style={glassStyle(true)}
              >
                <Send className="w-4 h-4" />
                Solicitar presupuesto
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Store Section
// ─────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: "Remeras", sub: "Algodón premium 190g",
    price: "Desde $1.800", bg: "#111111",
    icon: (
      <svg viewBox="0 0 100 116" className="w-24 h-28">
        <path d="M50,16 C42,16 34.5,13 29,7.5 L14.5,14.5 L2,23 L11.5,40.5 L22,36 L22,105.5 L78,105.5 L78,36 L88.5,40.5 L98,23 L85.5,14.5 L71,7.5 C65.5,13 58,16 50,16Z"
          fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M41.5,16 C43,22 46,26 50,27.5 C54,26 57,22 58.5,16"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2, name: "Buzos", sub: "French terry · Fleece",
    price: "Desde $3.200", bg: "#0e0e0e",
    icon: (
      <svg viewBox="0 0 100 116" className="w-24 h-28">
        <path d="M50,18 C44,21 37,23 28,23.5 L13,27 L2,30 L6,50 L18,46 L18,106 L82,106 L82,46 L94,50 L98,30 L87,27 L72,23.5 C63,23 56,21 50,18Z"
          fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.33)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M36,23.5 C38,36 42,46 50,50 C58,46 62,36 64,23.5"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeLinecap="round" />
        <rect x="44" y="50" width="12" height="20" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 3, name: "Tote Bags", sub: "Lona 100% algodón",
    price: "Desde $980", bg: "#1a1510",
    icon: (
      <svg viewBox="0 0 80 90" className="w-24 h-28">
        <rect x="8" y="24" width="64" height="62" rx="5"
          fill="rgba(196,168,130,0.18)" stroke="rgba(196,168,130,0.5)" strokeWidth="1.5" />
        <path d="M22,24 C22,12 28,4 40,4 C52,4 58,12 58,24"
          fill="none" stroke="rgba(196,168,130,0.5)" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="40" x2="72" y2="40" stroke="rgba(196,168,130,0.2)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 4, name: "Gorras", sub: "6 paneles estructuradas",
    price: "Desde $1.400", bg: "#0c0d14",
    icon: (
      <svg viewBox="0 0 90 70" className="w-24 h-28">
        <path d="M10,42 C10,24 24,10 45,10 C66,10 80,24 80,42"
          fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <rect x="4" y="40" width="82" height="10" rx="5"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <rect x="4" y="50" width="48" height="7" rx="3.5"
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <line x1="45" y1="10" x2="45" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx="45" cy="42" r="4" fill="rgba(255,255,255,0.18)" />
      </svg>
    ),
  },
  {
    id: 5, name: "Stickers", sub: "Vinilo resistente al agua",
    price: "Desde $120", bg: "#0f0f0f",
    icon: (
      <svg viewBox="0 0 70 70" className="w-24 h-28">
        <circle cx="35" cy="35" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="4 2.5" />
        <circle cx="35" cy="35" r="18" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x="35" y="40" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="16" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700">★</text>
      </svg>
    ),
  },
  {
    id: 6, name: "Packs Marca", sub: "Kit completo para emprendimientos",
    price: "Desde $8.500", bg: "#090909",
    icon: (
      <svg viewBox="0 0 80 80" className="w-24 h-28">
        <rect x="12" y="30" width="56" height="48" rx="4"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
        <path d="M12,42 L40,52 L68,42" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" />
        <path d="M12,30 L40,10 L68,30" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
        <line x1="40" y1="10" x2="40" y2="52" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <rect x="34" y="52" width="12" height="26" fill="rgba(255,255,255,0.06)" stroke="none" />
      </svg>
    ),
  },
];

const ProductCard = ({ product, index }: { product: typeof PRODUCTS[0]; index: number }) => {
  const { ref, visible } = useScrollFade();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl cursor-pointer group"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.065)",
        transition: "all 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: visible
          ? hovered
            ? "translateY(-5px) scale(1.012)"
            : "translateY(0) scale(1)"
          : "translateY(14px) scale(0.98)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${index * 70}ms`,
        boxShadow: hovered
          ? "0 24px 64px rgba(0,0,0,0.5)"
          : "0 4px 24px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product visual */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: product.bg }}
      >
        {product.icon}
        {/* Hover actions */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2.5 transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <button
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={glassStyle()}
          >
            <Eye className="w-3.5 h-3.5" />
            Ver
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={glassStyle(true)}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3
          className="text-xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {product.name}
        </h3>
        <p
          className="text-white/38 text-xs mt-1"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {product.sub}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span
            className="text-white/65 text-sm"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {product.price}
          </span>
          <ChevronRight
            className="w-4 h-4 text-white/25 group-hover:text-white/55 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

const StoreSection = () => {
  const { ref, visible } = useScrollFade();
  return (
    <section id="store" className="relative py-24 md:py-32" style={{ background: "#080808" }}>
      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 20% 50%, rgba(255,255,255,0.016) 0%, transparent 70%)",
        }}
      />
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 md:px-12 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-14">
          <p
            className="text-white/35 text-[10px] tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            04 — Tienda
          </p>
          <h2
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Explorá el catálogo
          </h2>
          <p
            className="text-white/38 mt-3 text-sm max-w-md mx-auto"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Cada prenda es un lienzo en blanco esperando tu marca.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────
const Footer = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "¿Cuál es la cantidad mínima?", a: "A partir de 6 unidades por diseño." },
    { q: "¿Cuánto demora la producción?", a: "Entre 5 y 10 días hábiles según técnica y cantidad." },
    { q: "¿Hacen envíos?", a: "Sí, a todo el país. También podés retirar en nuestro local." },
    { q: "¿Puedo enviar mi propio diseño?", a: "Por supuesto. Aceptamos AI, PDF, PNG y vectores. Nuestro equipo lo adapta para producción." },
  ];

  return (
    <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <svg viewBox="0 0 28 28" className="w-7 h-7 flex-shrink-0">
                <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.9" />
                <ellipse cx="14" cy="14" rx="13" ry="4" fill="none" stroke="white" strokeWidth="1.4" opacity="0.62" transform="rotate(-28 14 14)" />
              </svg>
              <span
                className="text-white text-sm font-semibold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em" }}
              >
                URANO
              </span>
            </div>
            <p
              className="text-white/38 text-sm leading-relaxed max-w-xs"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Estudio creativo especializado en estampado personalizado, branding y diseño textil.
              Fabricamos lo que imaginás.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-8">
              {[
                { icon: <Instagram className="w-4 h-4" />, label: "@uranoestampas" },
                { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp" },
                { icon: <Mail className="w-4 h-4" />, label: "hola@urano.com" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  title={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/45 hover:text-white transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="md:col-span-2">
            <p
              className="text-white/35 text-[10px] tracking-[0.28em] uppercase mb-6"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Preguntas frecuentes
            </p>
            <div className="space-y-2.5">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl"
                  style={cardStyle}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span
                      className="text-white/68 text-sm font-medium pr-4"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 text-white/35 flex-shrink-0 transition-transform duration-300"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "none" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4">
                      <p
                        className="text-white/40 text-sm leading-relaxed"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.045)" }}
        >
          <p
            className="text-white/22 text-xs"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            © 2024 Urano Estampas y Diseño. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {["Términos y condiciones", "Política de privacidad"].map((item) => (
              <button
                key={item}
                className="text-white/22 hover:text-white/45 text-xs transition-colors"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [design, setDesign] = useState<{
    color: ShirtColorKey;
    artwork: ArtworkState | null;
  } | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes starTwinkle {
        from { opacity: 0.12; transform: scale(1); }
        to   { opacity: 0.72; transform: scale(1.35); }
      }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 0; height: 0; }
      ::placeholder { color: rgba(255,255,255,0.2) !important; }
      select option  { background: #111; color: #f0f0f0; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ background: "#080808", color: "#f0f0f0", fontFamily: "Inter, sans-serif" }}>
      <Nav />
      <HeroSection />
      <CustomizerSection onContinue={setDesign} />
      <QuoteSection design={design} />
      <StoreSection />
      <Footer />
    </div>
  );
}
