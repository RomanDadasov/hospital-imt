import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5171/api";

const gradients = [
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-indigo-500",
];

const glowColors = [
  "#10b981", "#06b6d4", "#8b5cf6", "#f43f5e", "#f59e0b", "#3b82f6"
];

// ─────────────── MAGNETIC BUTTON ───────────────
function MagneticBtn({ children, className, ...rest }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouse = (e) => {
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
      onMouseMove={handleMouse}
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


function DepartmentCard({ dept, index, gradient, glowColor }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 6) * 0.08, duration: 0.6 }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative cursor-pointer h-full"
    >
    
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-0.5 rounded-3xl blur-xl pointer-events-none"
            style={{ background: `radial-gradient(circle at center, ${glowColor}40, transparent 70%)` }}
          />
        )}
      </AnimatePresence>
      
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image Container - Fixed Height */}
        <div className="h-48 overflow-hidden relative flex-shrink-0">
          {dept.imageUrl ? (
            <>
              <motion.img 
                src={dept.imageUrl} 
                alt={dept.name} 
                className="w-full h-full object-cover"
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <motion.div 
              className={`w-full h-full bg-gradient-to-br ${gradient}`}
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-7xl opacity-80">
                  {["🏥", "❤️", "🧠", "🦴", "🫁", "👁️"][index % 6]}
                </span>
              </div>
            </motion.div>
          )}
          
          {/* Dekorativ element */}
          <motion.div 
            className="absolute top-3 right-3 w-16 h-16 rounded-full blur-2xl"
            style={{ background: glowColor }}
            animate={{ opacity: isHovered ? 0.6 : 0.2 }}
          />
          
          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white border border-white/20">
              {dept.doctorCount || 0} Specialists
            </span>
          </div>
        </div>

        {/* Content - Flex-grow ilə bərabər hündürlük */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <motion.h3 
              className="font-black text-white text-lg"
              animate={isHovered ? { x: 4 } : { x: 0 }}
            >
              {dept.name}
            </motion.h3>
            <motion.div
              animate={isHovered ? { rotate: 45 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs"
            >
              →
            </motion.div>
          </div>
          
          {dept.description ? (
            <p className="text-white/40 text-sm leading-relaxed line-clamp-2 flex-grow">
              {dept.description}
            </p>
          ) : (
            <p className="text-white/30 text-xs italic flex items-center gap-2 flex-grow">
              <span className="text-lg">💫</span> Professional medical service
            </p>
          )}
          
         
          {dept.doctorCount > 0 && (
            <motion.div 
              className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between"
              animate={isHovered ? { y: -2 } : { y: 0 }}
            >
              <div className="flex items-center -space-x-2">
                {[...Array(Math.min(dept.doctorCount, 3))].map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px]"
                  >
                    👨‍⚕️
                  </div>
                ))}
                {dept.doctorCount > 3 && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400">
                    +{dept.doctorCount - 3}
                  </div>
                )}
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-md`}>
                <span>👨‍⚕️</span>
                <span>{dept.doctorCount}</span>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Hover line */}
        <motion.div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
          initial={{ width: 0 }}
          animate={isHovered ? { width: "100%" } : { width: 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  );
}

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const num = parseInt(target);
        if (isNaN(num)) return;
        const step = num / (duration / 16);
        let cur = 0;
        const interval = setInterval(() => {
          cur += step;
          if (cur >= num) {
            setCount(num);
            clearInterval(interval);
          } else {
            setCount(Math.floor(cur));
          }
        }, 16);
        return () => clearInterval(interval);
      }
    }, { threshold: 0.3 });
    
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started, target, duration]);
  
  return { ref, count };
}

function StatItem({ value, label, icon, color }) {
  const { ref, count } = useCounter(value);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="text-center group"
    >
      <motion.div 
        className="text-4xl mb-3 inline-block"
        whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.4 }}
      >
        {icon}
      </motion.div>
      <p 
        className="text-4xl font-black mb-1.5"
        style={{ color, textShadow: `0 0 20px ${color}60` }}
      >
        <span ref={ref}>{count}</span>+
      </p>
      <p className="text-xs font-semibold tracking-wide text-white/40">{label}</p>
    </motion.div>
  );
}


export default function PublicDepartmentsPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 300], [0, -100]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch(`${API_URL}/departments`);
        const data = await res.json();
        setDepartments(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  return (
    <div className="overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(16,185,129,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(6,182,212,0.1),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
        </div>
        
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        
        <FloatingOrb size={400} x="-10%" y="20%" color="rgba(16,185,129,0.08)" delay={0} duration={8} />
        <FloatingOrb size={350} x="70%" y="50%" color="rgba(6,182,212,0.06)" delay={2} duration={10} />
        <FloatingOrb size={300} x="50%" y="10%" color="rgba(139,92,246,0.05)" delay={1} duration={7} />
        <FloatingOrb size={250} x="90%" y="80%" color="rgba(245,158,11,0.04)" delay={3} duration={9} />
        
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
            }}
            animate={{ opacity: [0, 0.8, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
        
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="relative max-w-6xl mx-auto px-6 py-20 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm text-emerald-400 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full border border-emerald-500/30 mb-8">
              <motion.span 
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {t("OurServices") || "Medical Excellence"}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black text-white mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontFamily: "'Georgia', serif" }}
          >
            {t("Departments") || "Medical Departments"}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {t("DepartmentsDescription") || "World-class specialists and state-of-the-art technology across every medical discipline"}
          </motion.p>
          
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">SCROLL</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* STATS SECTION */}
      <section className="relative py-16 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="500" label="Patients / Day" icon="🏥" color="#10b981" />
            <StatItem value="50" label="Specialist Doctors" icon="👨‍⚕️" color="#06b6d4" />
            <StatItem value="20" label="Departments" icon="🏢" color="#8b5cf6" />
            <StatItem value="24" label="Emergency Care" icon="🚑" color="#f59e0b" />
          </div>
        </div>
      </section>
      
      {/* DEPARTMENTS SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative h-[380px]"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl h-full overflow-hidden border border-white/10">
                  <div className="h-48 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-white/10 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-white/5 rounded-lg w-2/3 animate-pulse" />
                    <div className="h-8 bg-white/10 rounded-xl w-32 mt-4 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
          >
            <motion.div 
              className="text-8xl mb-6 inline-block"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏥
            </motion.div>
            <p className="text-white/40 font-semibold text-lg mb-2">No Departments Found</p>
            <p className="text-white/20 text-sm">Please check back later</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <p className="inline-flex items-center gap-2 text-white/30 text-sm font-mono">
                <span className="w-8 h-px bg-gradient-to-r from-transparent to-emerald-500/50" />
                {departments.length} SPECIALIZED DEPARTMENTS
                <span className="w-8 h-px bg-gradient-to-l from-transparent to-emerald-500/50" />
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 auto-rows-fr">
              {departments.map((dept, i) => (
                <DepartmentCard 
                  key={dept.id}
                  dept={dept}
                  index={i}
                  gradient={gradients[i % gradients.length]}
                  glowColor={glowColors[i % glowColors.length]}
                />
              ))}
            </div>
          </>
        )}
        
        {/* CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-28 relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(16,185,129,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(6,182,212,0.1),transparent_50%)]" />
          
          <motion.div 
            className="absolute inset-0 rounded-3xl"
            animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 50px rgba(16,185,129,0.15)", "0 0 0px rgba(16,185,129,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative px-8 py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-7xl mb-6"
            >
              🩺
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-white mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Not Sure Which Department?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/40 max-w-md mx-auto text-sm mb-8"
            >
              Use our intelligent symptom checker to find the right specialist for your needs
            </motion.p>
            
            <Link to="/symptom-checker">
              <MagneticBtn
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl cursor-pointer relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🩺 Symptom Checker
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </MagneticBtn>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}