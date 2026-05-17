import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import medicalSnake from "../../assets/img/medical-logo.jpg";


const stats = [
  { value: "500", suffix: "+", label: "Patients / Day", icon: "🏥", color: "#10b981" },
  { value: "50", suffix: "+", label: "Specialist Doctors", icon: "👨‍⚕️", color: "#06b6d4" },
  { value: "20", suffix: "+", label: "Departments", icon: "🏢", color: "#8b5cf6" },
  { value: "24", suffix: "/7", label: "Service", icon: "⏰", color: "#f59e0b" },
];

const services = [
  { emoji: "🧠", title: "Neurology", desc: "Brain & nervous system diagnostics with AI-assisted imaging", hue: "259 94% 51%", glow: "#8b5cf6" },
  { emoji: "❤️", title: "Cardiology", desc: "Advanced cardiovascular care using real-time 3D echo mapping", hue: "350 89% 60%", glow: "#f43f5e" },
  { emoji: "🦴", title: "Orthopedics", desc: "Robotic-assisted joint replacement & sports medicine", hue: "38 92% 50%", glow: "#f59e0b" },
  { emoji: "🫁", title: "Pulmonology", desc: "High-resolution CT lung scans & bronchoscopy suite", hue: "199 89% 48%", glow: "#0ea5e9" },
  { emoji: "🫃", title: "Gastroenterology", desc: "Capsule endoscopy & minimally invasive GI interventions", hue: "160 84% 39%", glow: "#10b981" },
  { emoji: "🫘", title: "Urology", desc: "Laser lithotripsy & laparoscopic urological surgery", hue: "217 91% 60%", glow: "#3b82f6" },
];

const whyUs = [
  { emoji: "🏆", title: "15+ Years Trust", desc: "Azerbaijan's premier medical institution since 2009", accent: "#f59e0b" },
  { emoji: "👨‍⚕️", title: "50+ Specialists", desc: "Board-certified experts across every discipline", accent: "#10b981" },
  { emoji: "🔬", title: "Latest Technology", desc: "3T MRI, robotic surgery, AI diagnostics on-site", accent: "#06b6d4" },
  { emoji: "🚑", title: "24/7 Emergency", desc: "Round-the-clock critical care & trauma response", accent: "#8b5cf6" },
];

const testimonials = [
  { name: "Leyla M.", role: "Patient, Cardiology", text: "The team here saved my life. Incredible care and cutting-edge treatment that I couldn't find anywhere else.", stars: 5 },
  { name: "Rashad A.", role: "Patient, Neurology", text: "From diagnosis to recovery, every step was handled with expertise and genuine compassion.", stars: 5 },
  { name: "Günel H.", role: "Patient, Orthopedics", text: "The robotic surgery procedure was flawless. I was walking within days. Truly world-class.", stars: 5 },
];

// Hər bir service üçün ətraflı məlumat
const serviceDetails = {
  Neurology: {
    fullDesc: "Our Neurology department uses AI-assisted imaging and advanced diagnostic tools to detect and treat brain disorders, epilepsy, Alzheimer's, Parkinson's, and multiple sclerosis. We offer minimally invasive neurosurgery and 24/7 stroke care.",
    technologies: ["AI Brain Scanning", "EEG Monitoring", "Deep Brain Stimulation", "Stroke Rehabilitation"],
    doctors: 8,
    experience: "15+ years",
    successRate: "98%"
  },
  Cardiology: {
    fullDesc: "State-of-the-art cardiovascular care using real-time 3D echo mapping, coronary angiography, and minimally invasive heart surgeries. We specialize in heart failure management, arrhythmia treatment, and preventive cardiology.",
    technologies: ["3D Echo Mapping", "Coronary Angiography", "Pacemaker Implantation", "Cardiac Rehabilitation"],
    doctors: 12,
    experience: "20+ years",
    successRate: "97%"
  },
  Orthopedics: {
    fullDesc: "Robotic-assisted joint replacement, sports medicine, and trauma surgery. We treat complex fractures, arthritis, spinal disorders, and offer physical therapy programs for faster recovery.",
    technologies: ["Robotic Surgery", "Arthroscopy", "Joint Replacement", "Sports Medicine"],
    doctors: 10,
    experience: "18+ years",
    successRate: "96%"
  },
  Pulmonology: {
    fullDesc: "High-resolution CT lung scans, bronchoscopy suite, and treatment for asthma, COPD, lung cancer, and sleep disorders. We offer pulmonary rehabilitation and advanced respiratory therapy.",
    technologies: ["High-Resolution CT", "Bronchoscopy", "Sleep Studies", "Pulmonary Rehab"],
    doctors: 6,
    experience: "12+ years",
    successRate: "95%"
  },
  Gastroenterology: {
    fullDesc: "Capsule endoscopy, minimally invasive GI interventions, and treatment for digestive disorders, liver diseases, inflammatory bowel disease, and pancreatic conditions.",
    technologies: ["Capsule Endoscopy", "Colonoscopy", "ERCP", "Liver Biopsy"],
    doctors: 7,
    experience: "14+ years",
    successRate: "96%"
  },
  Urology: {
    fullDesc: "Laser lithotripsy, laparoscopic urological surgery, and treatment for kidney stones, prostate disorders, bladder cancer, and male reproductive health issues.",
    technologies: ["Laser Lithotripsy", "Laparoscopic Surgery", "Prostate Treatment", "Kidney Stone Management"],
    doctors: 5,
    experience: "10+ years",
    successRate: "97%"
  }
};

/* ─────────────── HOOKS ─────────────── */
function useMouse() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return { x: springX, y: springY };
}

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const num = parseInt(target);
        if (isNaN(num)) return;
        const step = num / (duration / 16);
        let cur = 0;
        const t = setInterval(() => {
          cur += step;
          if (cur >= num) { setCount(num); clearInterval(t); } else setCount(Math.floor(cur));
        }, 16);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started, target, duration]);
  return { ref, count };
}


function Counter({ value, suffix }) {
  const { ref, count } = useCounter(value);
  return <span ref={ref}>{count}{suffix}</span>;
}

function MagneticBtn({ children, className, ...rest }) {
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
      ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={handle} onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className} {...rest}
    >
      {children}
    </motion.div>
  );
}

function FloatingOrb({ size, x, y, color, delay, duration }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{ y: [-30, 30, -30], x: [-15, 15, -15], opacity: [0.15, 0.4, 0.15], scale: [1, 1.15, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Star({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

/* ─────────────── HERO SECTION ─────────────── */
function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const mouse = useMouse();
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  }, []);

  const rotX = useTransform(mouse.y, [0, windowHeight || 800], [6, -6]);
  const rotY = useTransform(mouse.x, [0, windowWidth || 1200], [-8, 8]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg,#020c18 0%,#021a14 50%,#050d1a 100%)" }}>


      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 45%), radial-gradient(circle at 60% 85%, rgba(139,92,246,0.1) 0%, transparent 40%)" }} />

        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 25% 35%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 40% 10%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 55% 60%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 70% 25%,rgba(255,255,255,0.6),transparent),radial-gradient(1px 1px at 85% 70%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 92% 40%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 15% 75%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 30% 90%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 65% 80%,rgba(255,255,255,0.6),transparent)" }} />
      </div>

      {/* Floating orbs */}
      <FloatingOrb size={500} x="5%" y="-10%" color="rgba(16,185,129,0.12)" delay={0} duration={8} />
      <FloatingOrb size={400} x="70%" y="60%" color="rgba(6,182,212,0.1)" delay={2} duration={10} />
      <FloatingOrb size={350} x="40%" y="20%" color="rgba(139,92,246,0.08)" delay={1} duration={7} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-20 items-center w-full">

        {/* LEFT COLUMN */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(12px)" }}
          >
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase">Azerbaijan's Premier Medical Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black leading-[1.02] mb-6"
            style={{ fontSize: "clamp(3rem,7vw,5.5rem)", fontFamily: "'Georgia', serif" }}
          >
            <span className="text-white">Your Health</span><br />
            <span style={{ background: "linear-gradient(135deg,#34d399,#06b6d4,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Is Our
            </span><br />
            <span className="text-white">Priority.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.5)", maxWidth: "480px", fontFamily: "Georgia, serif" }}
          >
            Combining decades of expertise with breakthrough medical technology — because your wellbeing deserves nothing less than extraordinary.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/symptom-checker">
              <MagneticBtn
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 40px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.4)" }}
              >
                🩺 Symptom Checker
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
              </MagneticBtn>
            </Link>
            <Link to="/our-doctors">
              <MagneticBtn
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                👨‍⚕️ Our Doctors
              </MagneticBtn>
            </Link>
          </motion.div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex gap-10 mt-14 pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[{ n: "500+", l: "Patients/day" }, { n: "50+", l: "Doctors" }, { n: "15+", l: "Years" }].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>{s.n}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>


        <motion.div
          initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          className="hidden md:flex items-center justify-center"
          style={{ perspective: "900px" }}
        >
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="relative"
          >
            {/* Card */}
            <motion.div
              animate={{ y: [-12, 12, -12] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[340px] h-[340px] rounded-[2.5rem] overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)" }}
            >
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top left, rgba(16,185,129,0.2), transparent 60%)" }} />
              <div className="flex items-center justify-center h-full">
                <motion.img
                  src={medicalSnake} alt="MHC"
                  className="w-56 h-56 object-contain drop-shadow-2xl"
                  animate={{ scale: [1, 1.04, 1], filter: ["drop-shadow(0 0 20px rgba(16,185,129,0.4))", "drop-shadow(0 0 40px rgba(6,182,212,0.6))", "drop-shadow(0 0 20px rgba(16,185,129,0.4))"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>

              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-6, 6, -6], x: [0, 4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-10 rounded-2xl px-5 py-4"
              style={{ background: "rgba(255,255,255,0.98)", boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
              <p className="font-black text-2xl" style={{ color: "#10b981", fontFamily: "Georgia,serif" }}>500+</p>
              <p className="text-slate-500 text-xs font-semibold">Patients / day</p>
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6], x: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-10 rounded-2xl px-5 py-4"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 20px 60px rgba(16,185,129,0.5), 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              <p className="text-white font-black text-2xl" style={{ fontFamily: "Georgia,serif" }}>24/7</p>
              <p className="text-emerald-100 text-xs font-semibold">Emergency Care</p>
            </motion.div>

            <motion.div
              animate={{ y: [4, -4, 4] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute top-1/2 -left-16 -translate-y-1/2 rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 16px 50px rgba(0,0,0,0.25)", minWidth: "160px" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)" }}>✓</div>
                <div>
                  <p className="text-slate-800 font-bold text-xs">Online Booking</p>
                  <p className="text-slate-400 text-xs">Confirmed in 24h</p>
                </div>
              </div>
            </motion.div>


            <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none" style={{ boxShadow: "0 0 120px rgba(16,185,129,0.15)" }} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Scroll</span>
        <div className="w-[1px] h-12" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }} />
      </motion.div>
    </section>
  );
}


function StatsSection() {
  return (
    <section style={{ background: "#020c18", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            whileHover={{ y: -4 }}
            className="text-center group"
          >
            <motion.div
              className="text-4xl mb-3 inline-block"
              whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}
            >
              {s.icon}
            </motion.div>
            <p className="text-5xl font-black mb-1.5" style={{ color: s.color, fontFamily: "Georgia,serif", textShadow: `0 0 30px ${s.color}60` }}>
              <Counter value={s.value} suffix={s.suffix} />
            </p>
            <p className="text-sm font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


function ServicesSection() {
  const [hovered, setHovered] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (service) => {
    setSelectedService(service);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedService(null);
    document.body.style.overflow = "auto";
  };


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#020d1a" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            Our Services
          </span>
          <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontFamily: "Georgia,serif" }}>
            Medical Departments
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", maxWidth: "500px", margin: "0 auto", fontFamily: "Georgia,serif", fontStyle: "italic" }}>
            World-class specialists and state-of-the-art technology across every specialty
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
              onClick={() => openModal(s)}
              className="relative rounded-3xl p-8 cursor-pointer overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)" }}
            >
              <AnimatePresence>
                {hovered === i && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 60px ${s.glow}20, 0 0 60px ${s.glow}15` }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }} transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 relative"
                style={{ background: `hsl(${s.hue} / 0.12)`, border: `1px solid hsl(${s.hue} / 0.3)` }}
              >
                {s.emoji}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={hovered === i ? { boxShadow: [`0 0 0px ${s.glow}00`, `0 0 30px ${s.glow}60`, `0 0 0px ${s.glow}00`] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>

              <h3 className="font-black text-white text-xl mb-3" style={{ fontFamily: "Georgia,serif" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>

              <motion.div
                className="flex items-center gap-2 text-xs font-bold"
                style={{ color: `hsl(${s.hue})` }}
                initial={{ opacity: 0, x: -8 }}
                animate={hovered === i ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              >
                Click to Learn More
                <motion.span animate={hovered === i ? { x: [0, 4, 0] } : {}} transition={{ duration: 0.8, repeat: Infinity }}>→</motion.span>
              </motion.div>

              <div className="absolute top-0 right-0 w-24 h-24 rounded-3xl pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${s.glow}10, transparent 70%)` }} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link to="/our-departments">
            <MagneticBtn
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm cursor-pointer"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}
            >
              View All Departments
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </MagneticBtn>
          </Link>
        </motion.div>
      </div>

      {/* MODAL WINDOW */}
      <AnimatePresence>
        {modalOpen && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0a1a2a, #061218)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="relative h-32 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${selectedService.glow}40, transparent)` }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="text-7xl"
                >
                  {selectedService.emoji}
                </motion.div>

                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-3xl font-black text-white mb-2 text-center"
                  style={{ fontFamily: "Georgia,serif" }}
                >
                  {selectedService.title}
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-0.5 mx-auto mb-6 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${selectedService.glow}, transparent)` }}
                />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/60 leading-relaxed mb-6 text-center"
                >
                  {serviceDetails[selectedService.title]?.fullDesc || "Comprehensive medical care with cutting-edge technology and expert specialists dedicated to your health and recovery."}
                </motion.p>

                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-2xl font-black" style={{ color: selectedService.glow }}>
                      {serviceDetails[selectedService.title]?.doctors || "10+"}
                    </p>
                    <p className="text-white/40 text-xs">Specialists</p>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-2xl font-black" style={{ color: selectedService.glow }}>
                      {serviceDetails[selectedService.title]?.successRate || "96%"}
                    </p>
                    <p className="text-white/40 text-xs">Success Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-2xl font-black" style={{ color: selectedService.glow }}>
                      {serviceDetails[selectedService.title]?.experience || "15+"}
                    </p>
                    <p className="text-white/40 text-xs">Years Experience</p>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-2xl font-black" style={{ color: selectedService.glow }}>
                      24/7
                    </p>
                    <p className="text-white/40 text-xs">Emergency Care</p>
                  </div>
                </motion.div>

                {/* Technologies */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-6"
                >
                  <p className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="text-lg">🔬</span> Advanced Technologies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(serviceDetails[selectedService.title]?.technologies || ["Advanced Diagnostics", "Modern Equipment", "Expert Care"]).map((tech, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ background: `${selectedService.glow}20`, color: selectedService.glow, border: `1px solid ${selectedService.glow}30` }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>


                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-3 justify-center pt-4"
                >
                  <Link to="/symptom-checker">
                    <MagneticBtn
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
                      style={{ background: `linear-gradient(135deg, ${selectedService.glow}, ${selectedService.glow}cc)` }}
                    >
                      🩺 Book Appointment
                    </MagneticBtn>
                  </Link>
                  <Link to="/our-doctors">
                    <MagneticBtn
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                    >
                      👨‍⚕️ Our Doctors
                    </MagneticBtn>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


function WhyUsSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#010810" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 60%)" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#8b5cf6", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            Our Advantages
          </span>
          <h2 className="font-black text-white" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontFamily: "Georgia,serif" }}>
            Why Choose Us?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyUs.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="relative rounded-3xl p-8 text-center overflow-hidden group"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 50px ${w.accent}15` }}
              />

              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }} transition={{ duration: 0.7, ease: "easeInOut" }}
                className="text-5xl mb-5 inline-block"
              >
                {w.emoji}
              </motion.div>

              <div className="w-12 h-0.5 mx-auto mb-5 rounded-full" style={{ background: w.accent, opacity: 0.5 }} />

              <h3 className="font-black text-white mb-3" style={{ fontFamily: "Georgia,serif" }}>{w.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{w.desc}</p>

              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{ background: w.accent }}
                initial={{ width: 0 }} whileInView={{ width: "60%" }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.5, duration: 0.8 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#020c18" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#06b6d4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            Testimonials
          </span>
          <h2 className="font-black text-white" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontFamily: "Georgia,serif" }}>Patient Stories</h2>
        </motion.div>

        <div className="relative h-64">
          <AnimatePresence mode="wait">
            {testimonials.map((t, i) =>
              i === active && (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.96 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex flex-col items-center"
                >
                  <p className="text-xl leading-relaxed mb-8 italic" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Georgia,serif" }}>
                    "{t.text}"
                  </p>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} filled={j < t.stars} />)}
                  </div>
                  <p className="font-black text-white text-sm">{t.name}</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{t.role}</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === active ? 28 : 8, height: 8, background: i === active ? "#06b6d4" : "rgba(255,255,255,0.15)" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="relative overflow-hidden py-32" style={{ background: "#010810" }}>
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent)", top: "30%", left: "20%" }}
        animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative rounded-[2.5rem] p-16 text-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute top-0 left-0 w-40 h-40 rounded-[2.5rem]" style={{ background: "radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-[2.5rem]" style={{ background: "radial-gradient(circle at bottom right, rgba(6,182,212,0.1), transparent 70%)" }} />

          <motion.h2
            className="font-black text-white mb-4"
            style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontFamily: "Georgia,serif" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Ready to Book?
          </motion.h2>
          <motion.p
            className="text-lg mb-12"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Georgia,serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          >
            Use our intelligent symptom checker to connect with the right specialist today.
          </motion.p>

          <div className="flex flex-wrap gap-5 justify-center">
            <Link to="/symptom-checker">
              <MagneticBtn
                whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 50px rgba(16,185,129,0.4), 0 12px 32px rgba(0,0,0,0.4)" }}
              >
                🩺 Symptom Checker
              </MagneticBtn>
            </Link>
            <Link to="/our-doctors">
              <MagneticBtn
                whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                👨‍⚕️ View Our Doctors
              </MagneticBtn>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


export default function LandingPage() {
  return (
    <div className="overflow-x-hidden" style={{ background: "#020c18" }}>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}