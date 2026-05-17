import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import medicalSnake from "../../assets/img/medical-logo.jpg";
import heroVideo from "../../assets/img/angioqrafiya.mp4";


const values = [
  {
    emoji: "🎯", title: "Our Mission",
    desc: "To provide the highest quality medical care to every patient — because health is not a privilege, it is a right.",
    accent: "#10b981", num: "01",
  },
  {
    emoji: "👁️", title: "Our Vision",
    desc: "To become Azerbaijan's most trusted and innovative medical institution, setting the standard for the region.",
    accent: "#06b6d4", num: "02",
  },
  {
    emoji: "💎", title: "Our Values",
    desc: "Professionalism, radical transparency, genuine care — these are not slogans. They are the foundation of every decision we make.",
    accent: "#8b5cf6", num: "03",
  },
];

const achievements = [
  { value: "15+", label: "Years of Trust", icon: "🏆", color: "#f59e0b" },
  { value: "50+", label: "Specialists", icon: "👨‍⚕️", color: "#10b981" },
  { value: "20+", label: "Departments", icon: "🏢", color: "#06b6d4" },
  { value: "500+", label: "Patients / Day", icon: "🏥", color: "#8b5cf6" },
  { value: "98%", label: "Satisfaction", icon: "⭐", color: "#f43f5e" },
  { value: "24/7", label: "Always Open", icon: "⏰", color: "#34d399" },
];

const pillars = [
  { emoji: "👨‍⚕️", title: "Elite Physicians", desc: "Board-certified specialists at the forefront of their fields", accent: "#10b981" },
  { emoji: "🔬", title: "ISO Laboratory", desc: "Certified diagnostic center with cutting-edge equipment", accent: "#06b6d4" },
  { emoji: "🏥", title: "Smart Infrastructure", desc: "3T MRI, robotic surgery suites, and AI-assisted diagnostics", accent: "#8b5cf6" },
  { emoji: "🚑", title: "24/7 Emergency", desc: "Round-the-clock critical care and rapid trauma response", accent: "#f43f5e" },
];


function useMagnetic() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return { ref, sx, sy, onMove, onLeave };
}


function Btn({ children, style, className }) {
  const m = useMagnetic();
  return (
    <motion.div
      ref={m.ref} style={{ x: m.sx, y: m.sy, ...style }}
      onMouseMove={m.onMove} onMouseLeave={m.onLeave}
      whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


function Hero() {
  const { scrollY } = useScroll();
  const videoScale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const contentY = useTransform(scrollY, [0, 500], [0, 100]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video BG */}
      <motion.div className="absolute inset-0" style={{ scale: videoScale }}>
        <video
          className="absolute w-full h-full object-cover"
          autoPlay muted loop playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020c18]/95 via-[#020c18]/70 to-[#020c18]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020c18] via-transparent to-transparent" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, rgba(16,185,129,0.12) 0%, transparent 50%)" }} />

      {/* Scanline texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)", backgroundSize: "100% 3px" }} />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative w-full max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-20 items-center">

        {/* LEFT */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-12" style={{ background: "#10b981" }} />
            <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: "#10b981" }}>About MHC</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black leading-[1.0] mb-6"
            style={{ fontSize: "clamp(3.2rem,7vw,5.5rem)", fontFamily: "Georgia, serif" }}
          >
            <span className="text-white">For Your</span><br />
            <span className="text-white">Health,</span><br />
            <span style={{ background: "linear-gradient(135deg,#34d399,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              We Are Here.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-base leading-relaxed mb-4"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: 460, fontFamily: "Georgia,serif" }}
          >
            MHC is Azerbaijan's premier medical institution — operating since 2010 with the most advanced hospital management system in the country.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-sm leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.3)", maxWidth: 440, fontFamily: "Georgia,serif", fontStyle: "italic" }}
          >
            Modern equipment, world-class physicians, and a culture of genuine care — this is what sets us apart.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/our-doctors">
              <Btn
                className="flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 40px rgba(16,185,129,0.35), 0 8px 24px rgba(0,0,0,0.4)" }}
              >
                👨‍⚕️ Our Doctors
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </Btn>
            </Link>
            <Link to="/symptom-checker">
              <Btn
                className="flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                🩺 Symptom Checker
              </Btn>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT — floating card */}
        <motion.div
          initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          className="hidden md:flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[300px] h-[300px] rounded-[2.5rem] overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.15)",
              }}
            >
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top left, rgba(16,185,129,0.2), transparent 60%)" }} />
              <motion.img
                src={medicalSnake} alt="MHC"
                className="w-48 h-48 object-contain relative z-10"
                animate={{ filter: ["drop-shadow(0 0 20px rgba(16,185,129,0.4))", "drop-shadow(0 0 40px rgba(6,182,212,0.6))", "drop-shadow(0 0 20px rgba(16,185,129,0.4))"] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              {/* shine */}
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.div>

            {/* badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-8 rounded-2xl px-5 py-4"
              style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              <p className="font-black text-2xl" style={{ color: "#10b981", fontFamily: "Georgia,serif" }}>15+</p>
              <p className="text-slate-500 text-xs font-semibold">Years of Trust</p>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-6 -left-8 rounded-2xl px-5 py-4"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 20px 60px rgba(16,185,129,0.5)" }}
            >
              <p className="text-white font-black text-2xl" style={{ fontFamily: "Georgia,serif" }}>50+</p>
              <p className="text-emerald-100 text-xs font-semibold">Doctors</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>Scroll</span>
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
      </motion.div>
    </section>
  );
}

function AchievementsBar() {
  return (
    <section style={{ background: "#010810", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-3 md:grid-cols-6 gap-6">
        {achievements.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="text-center"
          >
            <motion.div
              className="text-2xl mb-2 inline-block"
              whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}
            >
              {a.icon}
            </motion.div>
            <p className="text-3xl font-black mb-1" style={{ color: a.color, fontFamily: "Georgia,serif", textShadow: `0 0 20px ${a.color}50` }}>
              {a.value}
            </p>
            <p className="text-xs font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>{a.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


function ValuesSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#020c18" }}>
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "70px 70px" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-10" style={{ background: "#8b5cf6" }} />
            <span className="text-xs font-black tracking-[0.3em] uppercase" style={{ color: "#8b5cf6" }}>Our Philosophy</span>
          </div>
          <h2 className="font-black text-white" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontFamily: "Georgia,serif" }}>
            What Drives Us
          </h2>
        </motion.div>

        <div className="space-y-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.7 }}
              whileHover={{ x: 8 }}
              className="group relative flex items-center gap-8 rounded-3xl p-8 cursor-default overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Accent left bar */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                style={{ background: v.accent }}
                initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
              />

              {/* Number */}
              <span className="text-6xl font-black flex-shrink-0 leading-none" style={{ color: "rgba(255,255,255,0.04)", fontFamily: "Georgia,serif" }}>
                {v.num}
              </span>

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${v.accent}18`, border: `1px solid ${v.accent}30` }}
              >
                {v.emoji}
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="font-black text-white text-xl mb-2" style={{ fontFamily: "Georgia,serif" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Georgia,serif", fontStyle: "italic" }}>{v.desc}</p>
              </div>

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 50px ${v.accent}10` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarsSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#010810" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 60%)" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs font-black tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#06b6d4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            Our Advantages
          </span>
          <h2 className="font-black text-white" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontFamily: "Georgia,serif" }}>
            Why Choose MHC?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group rounded-3xl p-8 text-center overflow-hidden cursor-default"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.15 }} transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}30` }}
              >
                {p.emoji}
              </motion.div>

              <div className="w-8 h-0.5 mx-auto mb-4 rounded-full" style={{ background: p.accent, opacity: 0.5 }} />

              <h3 className="font-black text-white mb-3 text-base" style={{ fontFamily: "Georgia,serif" }}>{p.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{p.desc}</p>

              {/* Bottom bar */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{ background: p.accent }}
                initial={{ width: 0 }} whileInView={{ width: "55%" }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.4, duration: 0.7 }}
              />

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 50px ${p.accent}12` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── CTA ─────────────── */
function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#020c18" }}>
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-[2.5rem] p-16 text-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute top-0 left-0 w-40 h-40" style={{ background: "radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-40 h-40" style={{ background: "radial-gradient(circle at bottom right, rgba(6,182,212,0.1), transparent 70%)" }} />

          <motion.h2
            className="font-black text-white mb-4"
            style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontFamily: "Georgia,serif" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Ready for a Consultation?
          </motion.h2>
          <motion.p
            className="text-lg mb-12"
            style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Georgia,serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          >
            Our team is ready to guide you toward the right specialist today.
          </motion.p>

          <div className="flex flex-wrap gap-5 justify-center">
            <Link to="/symptom-checker">
              <Btn
                className="flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 50px rgba(16,185,129,0.4), 0 12px 32px rgba(0,0,0,0.4)" }}
              >
                🩺 Symptom Checker
              </Btn>
            </Link>
            <Link to="/our-doctors">
              <Btn
                className="flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                👨‍⚕️ Meet Our Doctors
              </Btn>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden" style={{ background: "#020c18" }}>
      <Hero />
      <AchievementsBar />
      <ValuesSection />
      <PillarsSection />
      <CTASection />
    </div>
  );
}