import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gray-950 flex overflow-hidden">

  
      <div className="relative w-1/2 h-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="https://cdn.pixabay.com/video/2020/07/30/46204-446851612_large.mp4" type="video/mp4" />
        </video>

      
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/60" />

      
        <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center">
          <svg viewBox="0 0 400 80" className="w-80" fill="none">
            <motion.path
              d="M0,40 L80,40 L95,15 L108,65 L120,5 L133,75 L145,40 L180,40 L195,40 L210,40 L225,15 L238,65 L250,5 L263,75 L275,40 L400,40"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

       
        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 rounded-xl px-4 py-2 backdrop-blur-sm">
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-rose-400"
            />
            <span className="text-rose-300 text-xs font-semibold tracking-widest uppercase">{t("PageNotFound")}</span>
          </div>
        </div>

        <div className="absolute bottom-32 left-8 space-y-2">
          {[
            { icon: "❤️", label: "HR", value: "--", color: "text-rose-400" },
            { icon: "🩸", label: "BP", value: "--/--", color: "text-amber-400" },
            { icon: "🌡️", label: "TEMP", value: "--.--°", color: "text-sky-400" },
          ].map((v, i) => (
            <motion.div
              key={v.label}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              className={`flex items-center gap-2 text-xs font-mono ${v.color}`}
            >
              <span>{v.icon}</span>
              <span className="text-slate-500">{v.label}</span>
              <span className="font-bold">{v.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative w-1/2 h-full flex flex-col items-center justify-center px-16">

     
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.06),transparent_70%)]" />

     
        {["❤️", "💉", "🩺", "💊", "🩹"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-xl select-none pointer-events-none"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: [0, 0.7, 0], y: -120 }}
            transition={{ duration: 4 + i, delay: i * 1.2, repeat: Infinity, ease: "easeOut" }}
            style={{ left: `${10 + i * 18}%`, bottom: "5%" }}
          >
            {emoji}
          </motion.div>
        ))}

        <div className="relative z-10 text-center">

        
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <h1 className="text-[9rem] font-black leading-none select-none bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-300 to-slate-600">
              404
            </h1>
          </motion.div>

       
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4 mb-10"
          >
            <h2 className="text-2xl font-bold text-white">
              🚨 {t("NotFoundTitle")}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              {t("NotFoundDesc")}
            </p>
          </motion.div>

        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              ← {t("GoBack")}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-xl shadow-emerald-900/40 transition-all hover:-translate-y-0.5"
            >
              🏥 {t("BackToHospital")}
            </button>
          </motion.div>

          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-600 text-xs mt-10"
          >
            MedCare Hospital Management © 2025
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;