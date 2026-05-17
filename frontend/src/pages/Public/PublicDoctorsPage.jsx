import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5171/api";


const SPECIALIZATION_COLORS = {
  Neurology:       { hue: "259 94% 51%", glow: "#8b5cf6", icon: "🧠" },
  Cardiology:      { hue: "350 89% 60%", glow: "#f43f5e", icon: "❤️" },
  Orthopedics:     { hue: "38 92% 50%",  glow: "#f59e0b", icon: "🦴" },
  Pulmonology:     { hue: "199 89% 48%", glow: "#0ea5e9", icon: "🫁" },
  Gastroenterology:{ hue: "160 84% 39%", glow: "#10b981", icon: "🫃" },
  Urology:         { hue: "217 91% 60%", glow: "#3b82f6", icon: "🫘" },
};

function getSpecColor(spec = "") {
  const key = Object.keys(SPECIALIZATION_COLORS).find(k =>
    spec.toLowerCase().includes(k.toLowerCase())
  );
  return SPECIALIZATION_COLORS[key] || { hue: "160 84% 39%", glow: "#10b981", icon: "👨‍⚕️" };
}


function useMouse() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return { x: sx, y: sy };
}


function FloatingOrb({ size, x, y, color, delay, duration }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{ y: [-30, 30, -30], x: [-15, 15, -15], opacity: [0.12, 0.35, 0.12], scale: [1, 1.15, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function MagneticBtn({ children, className, style, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const handle = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.25);
  };
  return (
    <motion.div
      ref={ref} style={{ x: sx, y: sy, ...style }}
      onMouseMove={handle} onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className} {...rest}
    >
      {children}
    </motion.div>
  );
}


function CursorGlow() {
  const mouse = useMouse();
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 rounded-full"
      style={{
        width: 400, height: 400,
        x: mouse.x, y: mouse.y,
        translateX: "-50%", translateY: "-50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
      }}
    />
  );
}


function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="p-6 space-y-3">
        <div className="h-4 rounded-full w-3/4 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-3 rounded-full w-1/2 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="h-3 rounded-full w-2/3 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}


function DoctorCard({ doc, index }) {
  const [hovered, setHovered] = useState(false);
  const color = getSpecColor(doc.specialization);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-3xl overflow-hidden cursor-default group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        boxShadow: hovered ? `0 30px 80px rgba(0,0,0,0.5), 0 0 40px ${color.glow}20` : "0 4px 20px rgba(0,0,0,0.3)",
        transition: "box-shadow 0.4s ease",
      }}
    >
      
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-3xl pointer-events-none z-10"
            style={{ boxShadow: `inset 0 0 60px ${color.glow}15` }}
          />
        )}
      </AnimatePresence>

      {/* Image area */}
      <div className="relative h-60 overflow-hidden">
        {doc.profileImageUrl ? (
          <>
            <motion.img
              src={doc.profileImageUrl}
              alt={doc.fullName}
              className="w-full h-full object-cover object-top"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* gradient overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(2,12,24,0.9) 0%, rgba(2,12,24,0.3) 50%, transparent 100%)" }} />

            {/* Shine sweep */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)" }}
              animate={hovered ? { x: ["-100%", "200%"] } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, hsl(${color.hue} / 0.15), rgba(2,12,24,0.8))` }}>
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />

            <motion.div
              animate={hovered ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{
                  background: `hsl(${color.hue} / 0.15)`,
                  border: `1px solid hsl(${color.hue} / 0.3)`,
                  boxShadow: `0 0 30px ${color.glow}30`,
                }}
              >
                {doc.fullName?.[0] || color.icon}
              </div>
            </motion.div>
          </div>
        )}

        {/* Spec badge top-right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: hovered ? 1 : 0.7, x: 0 }}
          className="absolute top-4 right-4 z-20"
        >
          <span
            className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl"
            style={{
              background: `hsl(${color.hue} / 0.2)`,
              border: `1px solid hsl(${color.hue} / 0.4)`,
              color: `hsl(${color.hue})`,
              backdropFilter: "blur(12px)",
            }}
          >
            <span>{color.icon}</span>
            {doc.specialization}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        {/* Name */}
        <h3 className="font-black text-white text-base mb-1 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          {doc.fullName}
        </h3>

        {/* Divider */}
        <motion.div
          className="h-px rounded-full mb-3"
          style={{ background: `linear-gradient(to right, ${color.glow}50, transparent)` }}
          animate={{ width: hovered ? "100%" : "40%" }}
          transition={{ duration: 0.4 }}
        />

        {/* Department */}
        {doc.departmentName && (
          <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span style={{ color: color.glow }}>🏥</span>
            {doc.departmentName}
          </p>
        )}

        
        {doc.consultationFee > 0 && (
          <p className="text-xs font-black mb-4" style={{ color: color.glow }}>
            ₼ {doc.consultationFee} <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>consultation</span>
          </p>
        )}

        {/* Phone CTA */}
        {doc.phone ? (
          <a href={`tel:${doc.phone}`}>
            <MagneticBtn
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl w-full text-white"
              style={{
                background: `linear-gradient(135deg, ${color.glow}cc, ${color.glow}88)`,
                boxShadow: `0 4px 20px ${color.glow}30`,
              }}
            >
              📞 {doc.phone}
            </MagneticBtn>
          </a>
        ) : (
          <MagneticBtn
            className="flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            📅 Book Appointment
          </MagneticBtn>
        )}
      </div>

      
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${color.glow}60, transparent)` }}
      />
    </motion.div>
  );
}


function HeroSection({ search, setSearch, total, t }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      className="relative min-h-[60vh] flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg,#020c18 0%,#021a14 50%,#050d1a 100%)" }}
    >
     
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 45%), radial-gradient(circle at 60% 85%, rgba(139,92,246,0.08) 0%, transparent 40%)" }} />
       
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 25% 35%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 40% 10%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 55% 60%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 70% 25%,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 85% 70%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 15% 75%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 65% 80%,rgba(255,255,255,0.6),transparent)" }} />
      </div>

      
      <FloatingOrb size={500} x="5%" y="-10%" color="rgba(16,185,129,0.1)" delay={0} duration={8} />
      <FloatingOrb size={350} x="70%" y="55%" color="rgba(6,182,212,0.08)" delay={2} duration={10} />
      <FloatingOrb size={300} x="40%" y="10%" color="rgba(139,92,246,0.07)" delay={1} duration={7} />

     
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative w-full max-w-5xl mx-auto px-6 py-32 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(12px)" }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase">{t("OurTeam")}</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="font-black leading-tight mb-5"
          style={{ fontSize: "clamp(3rem,8vw,6rem)", fontFamily: "'Georgia', serif" }}
        >
          <span className="text-white">{t("OurDoctors") || "Our"} </span>
          <span style={{ background: "linear-gradient(135deg,#34d399,#06b6d4,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t("Doctors") || "Doctors"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg leading-relaxed mb-12 mx-auto"
          style={{ color: "rgba(255,255,255,0.4)", maxWidth: "500px", fontFamily: "Georgia, serif", fontStyle: "italic" }}
        >
          {t("DoctorsDescription") || "World-class specialists dedicated to your health and wellbeing."}
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="relative max-w-lg mx-auto"
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <motion.svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
              animate={search ? { color: "#10b981" } : {}}
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </motion.svg>
            <input
              type="text"
              placeholder={t("SearchDoctors") || "Search by name, specialization, department..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
              style={{ fontFamily: "Georgia, serif" }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }}
                >
                  ✕
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Glow under search */}
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 blur-2xl rounded-full"
            style={{ width: "80%", height: 20, background: "rgba(16,185,129,0.15)" }}
            animate={search ? { opacity: 1, width: "100%" } : { opacity: 0.5, width: "80%" }}
          />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex justify-center gap-10 mt-14 pt-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            { n: `${total || "50"}+`, l: "Specialists" },
            { n: "15+", l: "Years Experience" },
            { n: "24/7", l: "Available" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-white" style={{ fontFamily: "Georgia,serif" }}>{s.n}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</span>
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
      </motion.div>
    </section>
  );
}


function FilterBar({ active, setActive, specs }) {
  return (
    <div className="sticky top-0 z-40 py-4" style={{ background: "rgba(2,12,24,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["All", ...specs].map((spec, i) => {
          const color = spec === "All" ? { glow: "#10b981", hue: "160 84% 39%" } : getSpecColor(spec);
          const isActive = active === spec;
          return (
            <motion.button
              key={spec}
              onClick={() => setActive(spec)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 text-xs font-black px-4 py-2 rounded-xl transition-all duration-300"
              style={isActive ? {
                background: `hsl(${color.hue} / 0.2)`,
                border: `1px solid hsl(${color.hue} / 0.5)`,
                color: `hsl(${color.hue})`,
                boxShadow: `0 0 20px ${color.glow}20`,
              } : {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {spec === "All" ? "🏥 All" : `${getSpecColor(spec).icon} ${spec}`}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


function EmptyState({ t }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center py-32 text-center"
    >
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-7xl mb-6"
      >
        👨‍⚕️
      </motion.div>
      <p className="font-black text-white text-xl mb-2" style={{ fontFamily: "Georgia,serif" }}>{t("NoDoctorsFound") || "No Doctors Found"}</p>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Try a different search term or filter</p>
    </motion.div>
  );
}


export default function PublicDoctorsPage() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/doctors?pageSize=100`);
        const data = await res.json();
        setDoctors(data?.data?.items || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  
  const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentName?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = activeSpec === "All" || d.specialization === activeSpec;
    return matchSearch && matchSpec;
  });

  return (
    <div className="overflow-x-hidden" style={{ background: "#020c18", minHeight: "100vh" }}>
      <CursorGlow />

      <HeroSection search={search} setSearch={setSearch} total={doctors.length} t={t} />

      {!loading && specs.length > 0 && (
        <FilterBar active={activeSpec} setActive={setActiveSpec} specs={specs} />
      )}

      {/* Grid section */}
      <section className="relative py-20" style={{ background: "#020c18" }}>
       
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative max-w-7xl mx-auto px-6">

          {/* Result count */}
          <AnimatePresence>
            {!loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center justify-between mb-10"
              >
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Showing <span className="text-white font-bold">{filtered.length}</span> {t("DoctorsFound") || "specialists"}
                </p>
                <div className="h-px flex-1 mx-6" style={{ background: "rgba(255,255,255,0.05)" }} />
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? <EmptyState t={t} />
              : filtered.map((doc, i) => <DoctorCard key={doc.id} doc={doc} index={i} />)
            }
          </div>
        </div>
      </section>
    </div>
  );
}