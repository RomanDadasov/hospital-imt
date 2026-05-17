import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import pharmacyImg1 from "../../assets/img/Pharmacy Career Details_ Eligibility _ PCAT _ Salary.jpg";
import pharmacyImg2 from "../../assets/img/W tych sytuacjach recepty ze zniżką nie będzie_ Wątpliwości można zgłosić do urzędu.jpg";
import pharmacyImg3 from "../../assets/img/Wichtiger Rückruf von Blutdruck-Medikament – Apotheken reagieren sofort.jpg";
import pharmacyVideo from "../../assets/img/videoplayback.1774033829280.publer.com.mp4";


const stats = [
  { value: "500", suffix: "+", label: "Type of Medicine", icon: "💊", color: "#10b981" },
  { value: "24",  suffix: "/7", label: "Service", icon: "⏰", color: "#06b6d4" },
  { value: "10",  suffix: "+", label: "Year Experience", icon: "🏆", color: "#8b5cf6" },
];

const features = [
  { emoji: "💊", title: "Wide Assortment", desc: "Over 500 types of medicines, vitamins, and health products", hue: "160 84% 39%", glow: "#10b981" },
  { emoji: "📋", title: "E-Prescription System", desc: "Receive your doctor's electronic prescription via QR code", hue: "199 89% 48%", glow: "#0ea5e9" },
  { emoji: "🚀", title: "Fast Service", desc: "Queue-free, fast, and professional service", hue: "38 92% 50%", glow: "#f59e0b" },
  { emoji: "🔬", title: "Licensed Products", desc: "All products are certified for quality", hue: "259 94% 51%", glow: "#8b5cf6" },
  { emoji: "👨‍⚕️", title: "Expert Consultation", desc: "Our pharmacists recommend the most suitable medication for you", hue: "350 89% 60%", glow: "#f43f5e" },
  { emoji: "📦", title: "Home Delivery", desc: "We deliver your order to your home", hue: "217 91% 60%", glow: "#3b82f6" },
];

const whyChoose = [
  { emoji: "⚡", title: "Express Delivery", desc: "Same-day delivery within Baku", accent: "#10b981" },
  { emoji: "🔐", title: "Secure System", desc: "Encrypted e-prescription system", accent: "#06b6d4" },
  { emoji: "💎", title: "Best Prices", desc: "Competitive prices on all products", accent: "#f59e0b" },
  { emoji: "🤝", title: "Expert Team", desc: "Certified pharmacists available 24/7", accent: "#8b5cf6" },
];


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
          if (cur >= num) { setCount(num); clearInterval(t); } 
          else setCount(Math.floor(cur));
        }, 16);
        return () => clearInterval(t);
      }
    }, { threshold: 0.3 });
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handle = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: (e.clientX - rect.left - rect.width / 2) * 0.25,
      y: (e.clientY - rect.top - rect.height / 2) * 0.25,
    });
  };
  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      onMouseMove={handle}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      className={className}
      {...rest}
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
      animate={{ y: [-30, 30, -30], x: [-15, 15, -15], opacity: [0.1, 0.3, 0.1], scale: [1, 1.15, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}


function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={pharmacyVideo} type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/90 via-teal-900/80 to-slate-900/90" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(2,12,24,0.8) 0%, rgba(2,26,20,0.7) 50%, rgba(5,13,26,0.8) 100%)" }} />

      {/* Star field */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 25% 35%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 40% 10%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 55% 60%,rgba(255,255,255,0.2),transparent),radial-gradient(1px 1px at 70% 25%,rgba(255,255,255,0.5),transparent)" }} />

      {/* Floating Orbs */}
      <FloatingOrb size={500} x="-10%" y="10%" color="rgba(16,185,129,0.1)" delay={0} duration={8} />
      <FloatingOrb size={400} x="70%" y="50%" color="rgba(6,182,212,0.08)" delay={2} duration={10} />
      <FloatingOrb size={350} x="80%" y="-10%" color="rgba(139,92,246,0.06)" delay={1} duration={7} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-20 items-center w-full">
        
        {/* LEFT COLUMN */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(12px)" }}
          >
            <motion.span className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase">MedCare Pharmacy</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black leading-[1.02] mb-6"
            style={{ fontSize: "clamp(3rem,7vw,5.5rem)", fontFamily: "'Georgia', serif" }}
          >
            <span className="text-white">For Your Health</span><br />
            <span style={{ background: "linear-gradient(135deg,#34d399,#06b6d4,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              The Best
            </span><br />
            <span className="text-white">Pharmacy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.5)", maxWidth: "480px", fontFamily: "Georgia, serif" }}
          >
            We are at your service with a wide range of medicines, a professional pharmacist team, and an electronic prescription system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#about">
              <MagneticBtn
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 40px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.4)" }}
              >
                💊 Detailed Information
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
              </MagneticBtn>
            </a>
            <a href="tel:+994501234567">
              <MagneticBtn
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                📞 Call Now
              </MagneticBtn>
            </a>
          </motion.div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex gap-10 mt-14 pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[{ n: "500+", l: "Medicines" }, { n: "24/7", l: "Service" }, { n: "10+", l: "Years" }].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>{s.n}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT COLUMN — 3D Card */}
        <motion.div
          initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          className="hidden md:flex items-center justify-center"
          style={{ perspective: "900px" }}
        >
          <motion.div
            animate={{ y: [-12, 12, -12] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Main Card */}
            <motion.div
              className="relative w-[340px] h-[340px] rounded-[2.5rem] overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.15)" }}
            >
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top left, rgba(16,185,129,0.2), transparent 60%)" }} />
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  💊
                </motion.div>
                <p className="text-white/60 text-sm font-mono tracking-wider">MedCare Pharmacy</p>
                <div className="flex gap-2 mt-4">
                  {["✓", "✓", "✓"].map((c, i) => (
                    <motion.span key={i} className="text-emerald-400 text-xs" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ delay: i * 0.5, duration: 2, repeat: Infinity }}>
                      {c}
                    </motion.span>
                  ))}
                </div>
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
              animate={{ y: [-6, 6, -6], x: [0, 4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-10 rounded-2xl px-5 py-4"
              style={{ background: "rgba(255,255,255,0.98)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            >
              <p className="font-black text-2xl" style={{ color: "#10b981", fontFamily: "Georgia,serif" }}>500+</p>
              <p className="text-slate-500 text-xs font-semibold">Medicines</p>
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6], x: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-10 rounded-2xl px-5 py-4"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 20px 60px rgba(16,185,129,0.5)" }}
            >
              <p className="text-white font-black text-2xl" style={{ fontFamily: "Georgia,serif" }}>24/7</p>
              <p className="text-emerald-100 text-xs font-semibold">Service</p>
            </motion.div>

            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute top-1/2 -left-16 -translate-y-1/2 rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 16px 50px rgba(0,0,0,0.25)", minWidth: "140px" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)" }}>🚀</div>
                <div>
                  <p className="text-slate-800 font-bold text-xs">Free Delivery</p>
                  <p className="text-slate-400 text-xs">Within Baku</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
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
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            whileHover={{ y: -4 }}
            className="text-center group"
          >
            <motion.div
              className="text-4xl mb-3 inline-block"
              whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
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


function AboutSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="about" className="relative py-32 overflow-hidden" style={{ background: "#020d1a" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT COLUMN - About Text & Features */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-8"
            >
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                About Us
              </span>
              <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontFamily: "Georgia,serif" }}>
                About the Pharmacy
              </h2>
              <p className="text-white/40 leading-relaxed">
                MedCare Pharmacy has been operating since 2014. We provide our patients with the highest quality pharmaceutical products and professional consultation services. Thanks to our modern electronic prescription system, you can receive the prescription written by your doctor in seconds via a QR code.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
                  className="relative rounded-2xl p-4 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.1 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `hsl(${f.hue} / 0.12)`, border: `1px solid hsl(${f.hue} / 0.3)` }}
                    >
                      {f.emoji}
                    </motion.div>
                    <div>
                      <p className="font-bold text-white text-sm sm:text-base">{f.title}</p>
                      <p className="text-xs sm:text-sm text-white/40 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 30px ${f.glow}20` }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.img 
                src={pharmacyImg1} 
                alt="Pharmacy 1"
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="w-full h-40 md:h-48 object-cover rounded-2xl shadow-xl"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <motion.img 
                src={pharmacyImg2} 
                alt="Pharmacy 2"
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="w-full h-40 md:h-48 object-cover rounded-2xl shadow-xl mt-6 md:mt-8"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <motion.img 
              src={pharmacyImg3} 
              alt="Pharmacy 3"
              whileHover={{ scale: 1.02 }}
              className="w-full h-48 md:h-56 object-cover rounded-2xl shadow-xl"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function WhyChooseSection() {
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
            Why MedCare Pharmacy?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChoose.map((w, i) => (
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
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
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


function EPrescriptionSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#020c18" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* E-Prescription Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full mb-5" style={{ color: "#06b6d4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
              Modern Solution
            </span>
            <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontFamily: "Georgia,serif" }}>
              E-Prescription System
            </h2>
            <p className="text-white/40 leading-relaxed mb-6">
              After your doctor creates the prescription, the PDF and prescription link will be sent to your email. You can open the link to see your prescription and show the QR code at the pharmacy.
            </p>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 text-sm text-teal-300">
              💡 If the prescription hasn't come to your email, please contact your doctor
            </div>
          </motion.div>

          {/* E-Prescription Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-2xl">🔐</div>
                  <div>
                    <p className="font-black text-white text-lg">E-Prescription System</p>
                    <p className="text-white/40 text-sm">Open your prescription from your email</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-xl">📧</div>
                    <div className="text-left">
                      <p className="text-white/50 text-xs">Email sent to</p>
                      <p className="text-white font-mono text-sm">patient@email.com</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-white/10 my-3" />
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-black/40 rounded-xl flex items-center justify-center text-2xl font-mono">QR</div>
                    <div className="text-left">
                      <p className="text-white/50 text-xs">Scan at pharmacy</p>
                      <p className="text-emerald-400 text-sm font-bold">✓ Instant verification</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/30 text-xs text-center">Secure • Encrypted • Instant</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="p-8 text-center">
            <h3 className="font-black text-white text-xl mb-6">📍 Contact Information</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">📞</div>
                <div className="text-left">
                  <p className="text-white/40 text-xs">Phone</p>
                  <a href="tel:+994501234567" className="text-white font-bold hover:text-emerald-400 transition-colors">+994 50 123 45 67</a>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-lg">📧</div>
                <div className="text-left">
                  <p className="text-white/40 text-xs">Email</p>
                  <a href="mailto:pharmacy@medcare.az" className="text-white font-bold hover:text-cyan-400 transition-colors">pharmacy@medcare.az</a>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">📍</div>
                <div className="text-left">
                  <p className="text-white/40 text-xs">Address</p>
                  <p className="text-white font-bold text-sm">Bakı, Nərimanov r., MedCare Hospital</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-lg">🕐</div>
                <div className="text-left">
                  <p className="text-white/40 text-xs">Working Hours</p>
                  <p className="text-white font-bold">24/7 — Always Open</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className="relative overflow-hidden py-32" style={{ background: "#010810" }}>
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[2.5rem] p-12 text-center overflow-hidden"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
        >
          <div className="absolute top-0 left-0 w-40 h-40 rounded-[2.5rem]" style={{ background: "radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-[2.5rem]" style={{ background: "radial-gradient(circle at bottom right, rgba(6,182,212,0.1), transparent 70%)" }} />

          <motion.h2
            className="font-black text-white mb-4"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", fontFamily: "Georgia,serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Need Medicine?
          </motion.h2>
          <motion.p
            className="text-lg mb-8"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Georgia,serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Contact us for any pharmaceutical needs or prescription fulfillment
          </motion.p>

          <div className="flex flex-wrap gap-5 justify-center">
            <a href="tel:+994501234567">
              <MagneticBtn
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)", boxShadow: "0 0 40px rgba(16,185,129,0.4)" }}
              >
                📞 Call Now
              </MagneticBtn>
            </a>
            <a href="#about">
              <MagneticBtn
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
              >
                💊 View Services
              </MagneticBtn>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


export default function PublicPharmacyPage() {
  return (
    <div className="overflow-x-hidden" style={{ background: "#020c18" }}>
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <WhyChooseSection />
      <EPrescriptionSection />
      <CTASection />
    </div>
  );
}