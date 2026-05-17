import { useEffect, useState } from "react";
import Badge from "../../components/common/Badge";
import { getDashboardStats, getDoctorDashboardStats } from "../../api/dashboardApi";
import { formatDateTime } from "../../utils/utils";
import useTokenStore from "../../stores/tokenStore";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const HeartDeco = ({ className = "", style = {} }) => (
  <svg viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={className} style={style}>
    <path d="M60 95 C60 95 10 60 10 30 C10 15 22 5 35 5 C45 5 55 12 60 20
             C65 12 75 5 85 5 C98 5 110 15 110 30 C110 60 60 95 60 95Z"
      fill="url(#hg)" fillOpacity="0.38" stroke="url(#hs)" strokeWidth="2" strokeOpacity="0.75" />
    <polyline points="20,55 30,55 36,40 42,70 50,30 56,60 62,60 68,48 74,60 84,60 90,55 100,55"
      fill="none" stroke="#059669" strokeWidth="2.2" strokeOpacity="0.75"
      strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="hg" x1="10" y1="5" x2="110" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
      <linearGradient id="hs" x1="10" y1="5" x2="110" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

const Orb = ({ color, size, top, left, right, bottom, opacity = 0.2 }) => (
  <div className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size, top, left, right, bottom,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(55px)", opacity,
    }} />
);

const glass = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.88)",
  boxShadow: "0 4px 24px rgba(5,150,105,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};

const StatCard = ({ label, value, icon, change, gradient, glow }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.025 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative rounded-3xl p-5 overflow-hidden cursor-default"
    style={{
      background: "rgba(255,255,255,0.68)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.92)",
      boxShadow: `0 6px 28px ${glow}, inset 0 1px 0 rgba(255,255,255,0.95)`,
    }}>
    <div className="absolute inset-0 rounded-3xl"
      style={{ background: `radial-gradient(circle at 25% 25%, ${glow.replace("0.28","0.1")} 0%, transparent 65%)` }} />
    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl"
      style={{ background: `linear-gradient(90deg, ${gradient})`, opacity: 0.8 }} />
    <div className="relative z-10 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: "rgba(6,78,59,0.6)" }}>{label}</p>
        <p className="text-4xl font-black leading-none tabular-nums" style={{ color: "#064e3b" }}>{value}</p>
        <p className="text-xs mt-2 font-medium" style={{ color: "rgba(6,78,59,0.5)" }}>{change}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${gradient})`, boxShadow: `0 4px 16px ${glow}` }}>
        <img src={icon} alt={label} className="w-full h-full object-cover" loading="lazy"
          onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
        <span className="text-xl hidden items-center justify-center w-full h-full">🏥</span>
      </div>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const { role } = useTokenStore();
  const isDoctor = role === "Doctor";
  const isPharmacist = role === "Pharmacist";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (isDoctor) {
          const res = await getDoctorDashboardStats();
          setStats(res.data.data);
        } else if (isPharmacist) {
          setStats(null); setLoading(false); return;
        } else {
          const res = await getDashboardStats();
          setStats(res.data.data);
        }
      } catch { } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDateLabel = (d) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const bgStyle = {
    background: "linear-gradient(135deg, #e8faf3 0%, #d0f5e8 35%, #c5f0e0 65%, #daf7ee 100%)",
    minHeight: "100vh",
  };

  if (isPharmacist) {
    return (
      <div className="relative pb-20 md:pb-0 p-4 md:p-6 space-y-5 overflow-hidden" style={bgStyle}>
        <Orb color="#10b981" size="500px" top="-100px" left="-100px" />
        <Orb color="#0ea5e9" size="400px" bottom="-80px" right="-80px" opacity={0.15} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 md:p-8 overflow-hidden" style={glass}>
          <HeartDeco className="absolute right-6 top-4" style={{ width: 100, height: 92, opacity: 0.6 }} />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shrink-0"
              style={{ background: "rgba(16,185,129,0.2)", border: "1.5px solid rgba(16,185,129,0.4)" }}>💊</div>
            <div>
              <h1 className="text-lg md:text-2xl font-black" style={{ color: "#064e3b" }}>Welcome to the Pharmacy Panel!</h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(6,78,59,0.6)" }}>Go to the Pharmacy page to check and issue e-prescriptions.</p>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          {[
            { icon: "📋", title: "Check E-Prescription" },
            { icon: "✅", title: "Give Prescription" },
            { icon: "🔐", title: "Secure System" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
              className="rounded-2xl p-6 text-center space-y-3" style={glass}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto"
                style={{ background: "rgba(16,185,129,0.18)", border: "1.5px solid rgba(16,185,129,0.35)" }}>
                {item.icon}
              </div>
              <p className="font-bold text-sm" style={{ color: "#065f46" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "rgba(6,78,59,0.6)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="relative rounded-2xl p-6 z-10" style={glass}>
          <h2 className="font-bold text-sm mb-4" style={{ color: "#065f46" }}>How does it work?</h2>
          <div className="space-y-3">
            {[
              { step: "1", text: "Go to the pharmacy page" },
              { step: "2", text: "Enter the patient's prescription QR code" },
              { step: "3", text: "Check the prescription information" },
              { step: "4", text: "'Click the 'Give Recipe' button" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1.5px solid rgba(16,185,129,0.4)", color: "#065f46" }}>
                  {item.step}
                </div>
                <p className="text-sm" style={{ color: "rgba(6,78,59,0.75)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="relative pb-20 md:pb-0 p-4 md:p-6 overflow-hidden" style={bgStyle}>
      <Orb color="#10b981" size="500px" top="-100px" left="-100px" />
      <div className={`grid gap-4 grid-cols-2 ${isDoctor ? "md:grid-cols-3" : "md:grid-cols-4"} mb-6`}>
        {Array.from({ length: isDoctor ? 3 : 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: "rgba(5,150,105,0.14)" }} />
        ))}
      </div>
      <div className="h-64 rounded-3xl animate-pulse" style={{ background: "rgba(5,150,105,0.1)" }} />
    </div>
  );

  const statItems = [
    { label: t("Patients"), value: stats?.totalPatients?.toLocaleString() || "0",
      icon: "src/assets/img/End-of-Life-Care.jpg",
      change: isDoctor ? t("MyPatients") : t("AddedThisMonth"),
      gradient: "#38bdf8, #0ea5e9", glow: "rgba(56,189,248,0.28)" },
    ...(!isDoctor ? [{
      label: t("TotalDoctors"), value: stats?.totalDoctors || 0,
      icon: "src/assets/img/OIP.webp", change: t("ActiveDoctors"),
      gradient: "#34d399, #059669", glow: "rgba(52,211,153,0.28)" }] : []),
    { label: t("TodayAppointments"), value: stats?.todayAppointments || 0,
      icon: "src/assets/img/OIP (1).webp", change: t("Today"),
      gradient: "#fbbf24, #d97706", glow: "rgba(251,191,36,0.28)" },
    { label: t("PendingAppointments"), value: stats?.pendingAppointments || 0,
      icon: "src/assets/img/indir.webp", change: t("Pending"),
      gradient: "#fb7185, #e11d48", glow: "rgba(251,113,133,0.28)" },
  ];

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const rawFirst = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const firstDay = rawFirst === 0 ? 6 : rawFirst - 1;
  const calDays = Array.from({ length: firstDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const deptColors = ["#059669","#0284c7","#d97706","#dc2626","#7c3aed","#0891b2","#ea580c","#db2777"];

  return (
    <div className="relative pb-20 md:pb-0 overflow-hidden" style={bgStyle}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <Orb color="rgba(16,185,129,1)"  size="520px" top="-120px" left="-120px" opacity={0.22} />
        <Orb color="rgba(5,150,105,1)"   size="440px" bottom="-100px" right="-80px" opacity={0.18} />
        <Orb color="rgba(52,211,153,1)"  size="300px" top="40%" left="45%" opacity={0.15} />
        <Orb color="rgba(14,165,233,1)"  size="260px" top="15%" right="5%" opacity={0.12} />
      </div>

      <div className="relative z-10 p-4 md:p-6 space-y-5">

        {/* Başlıq + Saat */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <HeartDeco style={{ width: 58, height: 54, opacity: 0.88 }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color: "#064e3b" }}>
                {t("Overview")}
                <span className="ml-2 text-emerald-500 font-black">·</span>
              </h1>
              <p className="text-xs md:text-sm mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>
                {isDoctor ? t("DoctorPanel") : "Hospital Management System"}
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.03 }}
            className="rounded-2xl px-4 md:px-6 py-3 text-center shrink-0" style={glass}>
            <p className="font-black text-lg md:text-2xl tabular-nums leading-none" style={{ color: "#064e3b" }}>
              {formatTime(currentTime)}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(6,78,59,0.55)" }}>{formatDateLabel(currentTime)}</p>
          </motion.div>
        </motion.div>

        {/* Stat kartları */}
        <div className={`grid gap-4 grid-cols-2 ${isDoctor ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {statItems.map((s, i) => (
            <motion.div key={i} transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Cədvəl + Sağ panel */}
        <div className={`grid gap-4 ${isDoctor ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${isDoctor ? "" : "lg:col-span-2"} rounded-3xl overflow-hidden`} style={glass}>
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1.5px solid rgba(5,150,105,0.18)" }}>
              <h2 className="font-bold text-sm" style={{ color: "#064e3b" }}>
                {isDoctor ? t("MyAppointments") : t("RecentAppointments")}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(5,150,105,0.15)", border: "1.5px solid rgba(5,150,105,0.3)", color: "#065f46" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse inline-block" />
                  {t("Live")}
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)", color: "#047857" }}>
                  {stats?.recentAppointments?.length || 0} {t("Total")}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(5,150,105,0.12)" }}>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(6,95,70,0.55)" }}>{t("Patient")}</th>
                    {!isDoctor && <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest hidden sm:table-cell" style={{ color: "rgba(6,95,70,0.55)" }}>{t("Doctor")}</th>}
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(6,95,70,0.55)" }}>{t("Date")}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(6,95,70,0.55)" }}>{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentAppointments || []).map((apt, i) => (
                    <motion.tr key={apt.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      style={{ borderBottom: "1px solid rgba(5,150,105,0.08)" }}
                      className="transition-all duration-150 cursor-default"
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(5,150,105,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>
                            {apt.patientName?.[0]}
                          </div>
                          <p className="text-sm font-semibold truncate max-w-[120px]" style={{ color: "#065f46" }}>{apt.patientName}</p>
                        </div>
                      </td>
                      {!isDoctor && <td className="px-6 py-3.5 text-sm hidden sm:table-cell" style={{ color: "rgba(6,78,59,0.65)" }}>{apt.doctorName}</td>}
                      <td className="px-6 py-3.5 text-xs" style={{ color: "rgba(6,78,59,0.55)" }}>{formatDateTime(apt.appointmentDate)}</td>
                      <td className="px-6 py-3.5"><Badge status={apt.status} /></td>
                    </motion.tr>
                  ))}
                  {(stats?.recentAppointments || []).length === 0 && (
                    <tr>
                      <td colSpan={isDoctor ? 3 : 4} className="px-6 py-12 text-center">
                        <HeartDeco style={{ width: 52, height: 48, margin: "0 auto 10px", opacity: 0.55 }} />
                        <p className="text-sm" style={{ color: "rgba(6,78,59,0.45)" }}>{t("NoAppointments")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {!isDoctor && (
            <div className="flex flex-col gap-4">
              {/* Təqvim */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }} className="rounded-3xl p-5 relative overflow-hidden" style={glass}>
                <HeartDeco className="absolute right-2 top-2" style={{ width: 90, height: 82, opacity: 0.28 }} />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="font-bold text-sm" style={{ color: "#064e3b" }}>{formatDateLabel(currentTime)}</h3>
                  <div className="flex gap-1">
                    {["‹","›"].map((ch, i) => (
                      <button key={i} className="w-7 h-7 rounded-xl flex items-center justify-center font-bold transition-all"
                        style={{ background: "rgba(5,150,105,0.14)", border: "1.5px solid rgba(5,150,105,0.25)", color: "#047857" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background="rgba(5,150,105,0.25)"; e.currentTarget.style.color="#064e3b"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background="rgba(5,150,105,0.14)"; e.currentTarget.style.color="#047857"; }}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-1 relative z-10">
                  {["M","T","W","T","F","S","S"].map((d, i) => (
                    <div key={i} className="text-center text-xs font-semibold py-1"
                      style={{ color: "rgba(6,95,70,0.55)" }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 relative z-10">
                  {calDays.map((day, i) => (
                    <div key={i}
                      className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all duration-150 font-medium ${
                        day === today.getDate() ? "text-white font-black shadow-md"
                          : day ? "cursor-pointer hover:bg-emerald-100/80" : ""
                      }`}
                      style={{
                        color: day === today.getDate() ? undefined : day ? "rgba(6,78,59,0.7)" : undefined,
                        ...(day === today.getDate() ? {
                          background: "linear-gradient(135deg, #10b981, #0ea5e9)",
                          boxShadow: "0 3px 12px rgba(16,185,129,0.5)",
                        } : {}),
                      }}>
                      {day || ""}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between relative z-10"
                  style={{ borderTop: "1.5px solid rgba(5,150,105,0.18)" }}>
                  <span className="text-xs font-medium" style={{ color: "rgba(6,78,59,0.6)" }}>Today's appointments</span>
                  <span className="font-black text-sm" style={{ color: "#059669" }}>{stats?.todayAppointments || 0}</span>
                </div>
              </motion.div>

              {/* Departamentlər */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }} className="rounded-3xl overflow-hidden flex-1" style={glass}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1.5px solid rgba(5,150,105,0.18)" }}>
                  <h3 className="font-bold text-sm" style={{ color: "#064e3b" }}>{t("Departments")}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(5,150,105,0.14)", border: "1.5px solid rgba(5,150,105,0.28)", color: "#065f46" }}>
                    {stats?.departments?.length || 0}
                  </span>
                </div>
                <div className="p-3 space-y-1 overflow-y-auto max-h-52">
                  {(stats?.departments || []).map((dept, i) => {
                    const c = deptColors[i % deptColors.length];
                    return (
                      <motion.div key={dept.id}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                        onMouseEnter={(e) => e.currentTarget.style.background="rgba(5,150,105,0.09)"}
                        onMouseLeave={(e) => e.currentTarget.style.background="transparent"}>
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: `${c}25`, border: `1.5px solid ${c}60` }}>
                          {dept.imageUrl ? (
                            <img src={dept.imageUrl} alt={dept.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <img src="src/assets/img/hsp.webp" alt="dept" className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display="none"; }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "#065f46" }}>{dept.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>{dept.doctorCount ?? 0} {t("Doctors")}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 5px ${c}99` }} />
                      </motion.div>
                    );
                  })}
                  {(stats?.departments || []).length === 0 && (
                    <p className="text-center text-xs py-6" style={{ color: "rgba(6,78,59,0.4)" }}>No departments</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;