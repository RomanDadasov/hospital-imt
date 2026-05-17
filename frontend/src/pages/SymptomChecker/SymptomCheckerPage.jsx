import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const bodyImage = "/src/assets/img/human-body-frontal.jpg";
const API_URL = "http://localhost:5171/api";

const organs = [
  {
    id: "head", labelKey: "Head", emoji: "🧠",
    top: "3%", left: "38%", width: "24%", height: "12%",
    specializations: ["Neurologist", "Neurosurgeon", "Neurology"],
    conditions: {
      mild:     ["MildHeadache", "Fatigue", "Insomnia"],
      moderate: ["Migraine", "Sinusitis", "Hypertension"],
      severe:   ["Stroke", "Meningitis", "BrainTumor"],
    },
  },
  {
    id: "neck", labelKey: "Neck", emoji: "🦴",
    top: "14.5%", left: "40%", width: "20%", height: "5%",
    specializations: ["Orthopedist", "Endocrinologist", "Traumatologist"],
    conditions: {
      mild:     ["MuscleTension", "BadSleep", "Stress"],
      moderate: ["CervicalOsteochondrosis", "ThyroidProblem", "LymphSwelling"],
      severe:   ["NeckHernia", "ThyroidCancer", "CarotidStenosis"],
    },
  },
  {
    id: "chest_left", labelKey: "Heart", emoji: "❤️",
    top: "19%", left: "33%", width: "18%", height: "10%",
    specializations: ["Cardiologist", "CardiacSurgeon", "Cardiology"],
    conditions: {
      mild:     ["Stress", "ExcessCoffee", "Anxiety"],
      moderate: ["Arrhythmia", "Hypertension", "Angina"],
      severe:   ["MyocardialInfarction", "HeartFailure", "Pericarditis"],
    },
  },
  {
    id: "chest_right", labelKey: "Lungs", emoji: "🫁",
    top: "19%", left: "49%", width: "18%", height: "10%",
    specializations: ["Pulmonologist", "ThoracicSurgeon", "Pulmonology", "Allergist"],
    conditions: {
      mild:     ["Cold", "Allergy", "Exercise"],
      moderate: ["Bronchitis", "Asthma", "Pneumonia"],
      severe:   ["COPD", "PulmonaryEmbolism", "LungCancer"],
    },
  },
  {
    id: "abdomen", labelKey: "Stomach", emoji: "🫃",
    top: "31%", left: "36%", width: "28%", height: "10%",
    specializations: ["Gastroenterologist", "GeneralSurgeon", "Gastroenterology"],
    conditions: {
      mild:     ["Indigestion", "Gas", "Stress"],
      moderate: ["Gastritis", "Reflux", "IBS"],
      severe:   ["StomachUlcer", "Pancreatitis", "Appendicitis"],
    },
  },
  {
    id: "pelvis", labelKey: "Kidney", emoji: "🫘",
    top: "42%", left: "36%", width: "28%", height: "8%",
    specializations: ["Urologist", "Nephrologist", "Gynecologist", "Urology"],
    conditions: {
      mild:     ["Dehydration", "UTIStart", "MusclePain"],
      moderate: ["KidneyStone", "Cystitis", "Pyelonephritis"],
      severe:   ["KidneyFailure", "KidneyCancer", "Glomerulonephritis"],
    },
  },
  {
    id: "left_arm", labelKey: "LeftArm", emoji: "💪",
    top: "20%", left: "14%", width: "18%", height: "22%",
    specializations: ["Orthopedist", "Traumatologist", "Physiotherapist", "OrthopedicSurgeon"],
    conditions: {
      mild:     ["MuscleStrain", "Overload", "Sprain"],
      moderate: ["TennisElbow", "CarpalTunnel", "Tendonitis"],
      severe:   ["Fracture", "RotatorCuffTear", "NerveCompression"],
    },
  },
  {
    id: "right_arm", labelKey: "RightArm", emoji: "💪",
    top: "20%", left: "68%", width: "18%", height: "22%",
    specializations: ["Orthopedist", "Traumatologist", "Physiotherapist", "OrthopedicSurgeon"],
    conditions: {
      mild:     ["MuscleStrain", "Overload", "Sprain"],
      moderate: ["TennisElbow", "CarpalTunnel", "Tendonitis"],
      severe:   ["Fracture", "RotatorCuffTear", "NerveCompression"],
    },
  },
  {
    id: "left_leg", labelKey: "LeftLeg", emoji: "🦵",
    top: "52%", left: "30%", width: "20%", height: "38%",
    specializations: ["Orthopedist", "VascularSurgeon", "Phlebologist", "Traumatologist"],
    conditions: {
      mild:     ["MuscleCramp", "Fatigue", "Inactivity"],
      moderate: ["VaricoseVeins", "Sciatica", "MeniscusProblem"],
      severe:   ["DVT", "ArterialOcclusion", "BoneFracture"],
    },
  },
  {
    id: "right_leg", labelKey: "RightLeg", emoji: "🦵",
    top: "52%", left: "50%", width: "20%", height: "38%",
    specializations: ["Orthopedist", "VascularSurgeon", "Phlebologist", "Traumatologist"],
    conditions: {
      mild:     ["MuscleCramp", "Fatigue", "Inactivity"],
      moderate: ["VaricoseVeins", "Sciatica", "MeniscusProblem"],
      severe:   ["DVT", "ArterialOcclusion", "BoneFracture"],
    },
  },
];

const severityConfig = {
  mild:     { labelKey: "Mild",   icon: "🟢", color: "from-green-500 to-emerald-500",  border: "border-green-500/40",  text: "text-green-400",  bg: "bg-green-500/10",  glow: "shadow-green-500/20" },
  moderate: { labelKey: "Moderate", icon: "🟡", color: "from-amber-500 to-orange-500",   border: "border-amber-500/40",  text: "text-amber-400",  bg: "bg-amber-500/10",  glow: "shadow-amber-500/20" },
  severe:   { labelKey: "Severe", icon: "🔴", color: "from-rose-500 to-red-500",       border: "border-rose-500/40",   text: "text-rose-400",   bg: "bg-rose-500/10",   glow: "shadow-rose-500/20" },
};

const filterDoctorsForOrgan = (allDoctors, organ) => {
  if (!allDoctors?.length || !organ?.specializations?.length) return [];
  return allDoctors.filter((doc) =>
    organ.specializations.some((spec) =>
      doc.specialization?.toLowerCase().includes(spec.toLowerCase()) ||
      spec.toLowerCase().includes(doc.specialization?.toLowerCase())
    )
  );
};

const AppointmentModal = ({ organ, severity, doctors, onClose }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ patientName: "", patientPhone: "", message: "" });
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0] || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.patientName.trim() || !form.patientPhone.trim()) { setError(t("NamePhoneRequired")); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName,
          patientPhone: form.patientPhone,
          message: form.message,
          doctorName: selectedDoctor?.fullName || "",
          doctorSpecialization: selectedDoctor?.specialization || "",
          bodyRegion: t(organ.labelKey),
          severity,
        }),
      });
      if (res.ok) setSuccess(true);
      else setError(t("ErrorOccurred"));
    } catch { setError(t("ConnectionError")); }
    finally { setLoading(false); }
  };

  const cfg = severityConfig[severity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,26,26,0.98))",
            border: "1px solid rgba(20,184,166,0.2)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(20,184,166,0.05)"
          }}
        >
          {/* Top Color Bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${cfg.color}`}/>

          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-xl shadow-lg ${cfg.glow}`}>
                {organ.emoji}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{t(organ.labelKey)} — {t("Appointment")}</p>
                <p className={`text-xs font-semibold ${cfg.text}`}>{cfg.icon} {t(cfg.labelKey)} {t("Severity")}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </motion.button>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-14 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-5"
              >✅</motion.div>
              <p className="text-white font-black text-xl mb-2">{t("RequestAccepted")}</p>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">{t("RequestAcceptedDesc")}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/20"
              >
                {t("Close")}
              </motion.button>
            </motion.div>
          ) : (
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {doctors.length > 0 ? (
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">{t("SelectDoctor")}</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {doctors.map((doc) => (
                      <motion.button
                        key={doc.id}
                        whileHover={{ x: 4 }}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          selectedDoctor?.id === doc.id
                            ? "bg-teal-500/15 border-teal-500/50"
                            : "bg-white/3 border-white/8 hover:border-white/15"
                        }`}
                      >
                        {doc.profileImageUrl ? (
                          <img src={doc.profileImageUrl} alt={doc.fullName} className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-teal-500/30"/>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                            {doc.fullName?.[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{doc.fullName}</p>
                          <p className="text-xs text-teal-400 font-medium">{doc.specialization}</p>
                        </div>
                        {selectedDoctor?.id === doc.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                  <span className="text-amber-400 text-lg shrink-0">⚠️</span>
                  <p className="text-amber-300/80 text-xs leading-relaxed font-medium">{t("NoDoctorsForRegion")}</p>
                </div>
              )}

              <div className="space-y-2.5">
                {[
                  { field: "patientName", placeholderKey: "FullName", type: "text" },
                  { field: "patientPhone", placeholderKey: "PhoneNumber", type: "tel" },
                ].map(({ field, placeholderKey, type }) => (
                  <div key={field} className="relative">
                    <input
                      type={type}
                      placeholder={t(placeholderKey) + " *"}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => e.target.style.border = "1px solid rgba(20,184,166,0.5)"}
                      onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                    />
                  </div>
                ))}
                <textarea
                  placeholder={t("AdditionalInfo")}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid rgba(20,184,166,0.5)"}
                  onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-center gap-2"
                  >
                    <span className="text-rose-400">⚠</span>
                    <p className="text-rose-400 text-xs font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    {t("Sending")}
                  </>
                ) : (
                  <>📅 {t("SendAppointmentRequest")}</>
                )}
              </motion.button>

              <p className="text-xs text-slate-600 text-center pb-1">{t("ReceptionistContact")}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function SymptomCheckerPage() {
  const { t } = useTranslation();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        const res = await fetch(`${API_URL}/doctors?pageSize=100`);
        const data = await res.json();
        setAllDoctors(data?.data?.items || []);
      } catch { setAllDoctors([]); }
      finally { setDoctorsLoading(false); }
    };
    fetchAllDoctors();
  }, []);

  const results = selected && severity ? selected.conditions[severity].map(key => t(key)) : null;
  const matchedDoctors = selected ? filterDoctorsForOrgan(allDoctors, selected) : [];

  const handleOrganSelect = (organ) => {
    setSelected(organ);
    setSeverity(null);
    setShowModal(false);
    setStep(2);
  };

  const handleSeveritySelect = (sev) => {
    setSeverity(sev);
    setStep(3);
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0a1628 40%, #021a1a 100%)" }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="absolute inset-0 opacity-3"
          style={{ backgroundImage: "linear-gradient(rgba(20,184,166,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
      </div>

      {/* Header */}
      <div className="relative text-center pt-14 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2 mb-6"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-teal-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-teal-300 text-xs font-bold tracking-widest uppercase">{t("DemoNotDiagnosis")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black tracking-tight mb-3"
        >
          {t("SymptomChecker")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            {t("Checker")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base max-w-md mx-auto leading-relaxed mb-4"
        >
          {t("SymptomCheckerDesc")}
        </motion.p>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          href="/education"
          className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-full px-5 py-2 text-emerald-400 text-xs font-bold transition-all"
        >
          📚 {t("MedicalEducation")} →
        </motion.a>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-3 mt-8"
        >
          {[
            { n: 1, labelKey: "SelectRegion" },
            { n: 2, labelKey: "Severity" },
            { n: 3, labelKey: "Result" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                step >= s.n
                  ? "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                  : "bg-white/3 border border-white/8 text-slate-600"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${step >= s.n ? "bg-teal-500 text-white" : "bg-white/10 text-slate-500"}`}>
                  {step > s.n ? "✓" : s.n}
                </span>
                {t(s.labelKey)}
              </div>
              {i < 2 && (
                <div className={`w-6 h-px ${step > s.n ? "bg-teal-500" : "bg-white/10"} transition-colors`}/>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-8 items-start justify-center">

        {/* Body Map */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 shrink-0"
        >
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"/>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t("ClickPainArea")}</p>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 bg-teal-500/15 border border-teal-500/30 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{selected.emoji}</span>
                    <span className="text-teal-300 text-xs font-bold">{t(selected.labelKey)}</span>
                  </motion.div>
                )}
              </div>

              <div className="relative" style={{ width: 300, height: 500 }}>
                <img src={bodyImage} alt="Human body" className="w-full h-full object-contain select-none" draggable={false}/>

                {organs.map((organ) => {
                  const isSelected = selected?.id === organ.id;
                  const isHovered = hovered === organ.id;
                  return (
                    <motion.div
                      key={organ.id}
                      onClick={() => handleOrganSelect(organ)}
                      onHoverStart={() => setHovered(organ.id)}
                      onHoverEnd={() => setHovered(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        position: "absolute",
                        top: organ.top, left: organ.left,
                        width: organ.width, height: organ.height,
                        cursor: "pointer", borderRadius: "50%",
                        background: isSelected
                          ? "rgba(20,184,166,0.3)"
                          : isHovered
                          ? "rgba(20,184,166,0.15)"
                          : "rgba(255,255,255,0.03)",
                        border: isSelected
                          ? "2px solid rgba(20,184,166,0.8)"
                          : isHovered
                          ? "2px solid rgba(20,184,166,0.4)"
                          : "2px solid rgba(255,255,255,0.06)",
                        boxShadow: isSelected ? "0 0 20px rgba(20,184,166,0.4), inset 0 0 15px rgba(20,184,166,0.1)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <AnimatePresence>
                        {(isHovered || isSelected) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{
                              fontSize: 10, fontWeight: 800,
                              color: "#99f6e4",
                              background: "rgba(2,26,26,0.92)",
                              borderRadius: 8,
                              padding: "3px 8px",
                              whiteSpace: "nowrap",
                              pointerEvents: "none",
                              border: "1px solid rgba(20,184,166,0.3)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                            }}
                          >
                            {organ.emoji} {t(organ.labelKey)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Select */}
          <div className="w-full rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="px-4 pt-3 pb-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t("QuickSelect")}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-3 pt-0">
              {organs.map((organ) => (
                <motion.button
                  key={organ.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOrganSelect(organ)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    selected?.id === organ.id
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                      : "bg-white/2 border-white/6 text-slate-400 hover:border-white/15 hover:text-slate-200"
                  }`}
                >
                  <span className="text-base">{organ.emoji}</span>
                  <span className="truncate">{t(organ.labelKey)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <div className="flex-1 space-y-4 min-w-0">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl p-16 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-5"
                >👆</motion.div>
                <p className="text-slate-300 font-bold text-lg mb-2">{t("SelectOrgan")}</p>
                <p className="text-slate-500 text-sm">{t("SelectOrganDesc")}</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Selected Organ */}
                <div className="rounded-3xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(16,185,129,0.04))",
                    border: "1px solid rgba(20,184,166,0.2)",
                    boxShadow: "0 0 40px rgba(20,184,166,0.05)"
                  }}
                >
                  <div className="h-px w-full bg-gradient-to-r from-teal-500/50 via-emerald-500/50 to-transparent"/>

                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-4xl shadow-lg shadow-teal-500/10"
                      >
                        {selected.emoji}
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-xs text-teal-400 uppercase tracking-widest font-bold mb-1">{t("SelectedRegion")}</p>
                        <p className="text-2xl font-black text-white">{t(selected.labelKey)}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelected(null); setSeverity(null); setStep(1); }}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </motion.button>
                    </div>

                    <p className="text-sm text-slate-400 font-semibold mb-3">{t("SelectSeverity")}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(severityConfig).map(([key, val]) => (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSeveritySelect(key)}
                          className={`relative py-4 rounded-2xl text-sm font-black border transition-all overflow-hidden ${
                            severity === key
                              ? `bg-gradient-to-br ${val.color} border-transparent text-white shadow-xl ${val.glow}`
                              : `bg-white/3 ${val.border} ${val.text} hover:bg-white/6`
                          }`}
                        >
                          {severity === key && (
                            <motion.div
                              className="absolute inset-0 bg-white/10"
                              animate={{ opacity: [0, 0.3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <span className="relative z-10 block text-lg mb-1">{val.icon}</span>
                          <span className="relative z-10">{t(val.labelKey)}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <AnimatePresence>
                  {results && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-3xl overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className={`h-px w-full bg-gradient-to-r ${severityConfig[severity].color}`}/>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <p className="text-sm font-black text-white">{t("PotentialConditions")}</p>
                          <span className={`text-xs px-3 py-1.5 rounded-full border font-bold ${severityConfig[severity].bg} ${severityConfig[severity].border} ${severityConfig[severity].text}`}>
                            {severityConfig[severity].icon} {t(severityConfig[severity].labelKey)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {results.map((condition, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 group hover:border-teal-500/20 transition-all"
                              style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                              <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${severityConfig[severity].color} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm`}>
                                {i + 1}
                              </span>
                              <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{condition}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Doctors */}
                <AnimatePresence>
                  {results && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-3xl overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"/>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">👨‍⚕️</span>
                            <p className="text-sm font-black text-white">{t("MatchingDoctors")}</p>
                          </div>
                          {doctorsLoading
                            ? <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"/>
                            : <span className="text-xs text-slate-500 bg-white/5 border border-white/8 px-3 py-1 rounded-lg font-semibold">
                                {matchedDoctors.length} {t("Doctors")}
                              </span>
                          }
                        </div>

                        {doctorsLoading ? (
                          <div className="py-8 text-center text-slate-500 text-sm">{t("LoadingDoctors")}</div>
                        ) : matchedDoctors.length > 0 ? (
                          <div className="space-y-2 mb-5">
                            {matchedDoctors.map((doc, i) => (
                              <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 border border-teal-500/15 hover:border-teal-500/30 transition-all group"
                                style={{ background: "rgba(20,184,166,0.05)" }}
                              >
                                {doc.profileImageUrl ? (
                                  <img src={doc.profileImageUrl} alt={doc.fullName}
                                    className="w-11 h-11 rounded-xl object-cover shrink-0 ring-2 ring-teal-500/20"/>
                                ) : (
                                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg">
                                    {doc.fullName?.[0]}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white">{doc.fullName}</p>
                                  <p className="text-xs text-teal-400 font-medium">{doc.specialization}</p>
                                  {doc.departmentName && <p className="text-xs text-slate-500">{doc.departmentName}</p>}
                                </div>
                                {doc.phone && (
                                  <a href={`tel:${doc.phone}`}
                                    className="flex items-center gap-1.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/25 text-teal-300 text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0"
                                  >
                                    📞 <span className="hidden sm:inline">{doc.phone}</span><span className="sm:hidden">{t("Call")}</span>
                                  </a>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center rounded-xl border border-white/5 mb-5"
                            style={{ background: "rgba(255,255,255,0.02)" }}
                          >
                            <p className="text-slate-400 text-sm font-semibold">{t("NoDoctorsForSpecialty")}</p>
                            <p className="text-slate-500 text-xs mt-1">{t("ReceptionistAssign")}</p>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowModal(true)}
                          className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-2xl shadow-teal-500/20"
                          style={{
                            background: "linear-gradient(135deg, #14b8a6, #10b981)",
                            boxShadow: "0 8px 32px rgba(20,184,166,0.25)"
                          }}
                        >
                          📅 {t("BookAppointment")}
                        </motion.button>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 p-4 rounded-2xl flex items-start gap-3"
                          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
                        >
                          <span className="text-amber-400 text-base shrink-0 mt-0.5">⚠️</span>
                          <p className="text-xs text-amber-300/70 leading-relaxed">{t("MedicalDisclaimer")}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showModal && selected && severity && (
        <AppointmentModal
          organ={selected}
          severity={severity}
          doctors={matchedDoctors}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}