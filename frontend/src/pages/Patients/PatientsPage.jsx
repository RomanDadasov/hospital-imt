import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getPatients, deletePatient } from "../../api/patientApi";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PatientFormModal from "./PatientFormModal";
import MedicalRecordModal from "./MedicalRecordModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const BG = "linear-gradient(135deg, #e8faf3 0%, #d0f5e8 35%, #c5f0e0 65%, #daf7ee 100%)";
const glass = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.88)",
  boxShadow: "0 4px 24px rgba(5,150,105,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};
const Orb = ({ color, size, top, left, right, bottom, opacity = 0.18 }) => (
  <div className="fixed rounded-full pointer-events-none"
    style={{
      width: size, height: size, top, left, right, bottom, zIndex: -1,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(60px)", opacity
    }} />
);
const rowV = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.28 } }),
};
const avatarGrads = [
  "from-sky-400 to-blue-500", "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500", "from-amber-400 to-orange-500", "from-rose-400 to-pink-500",
];

const PatientsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medicalPatient, setMedicalPatient] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatients({ searchTerm: search, page, pageSize: 10 });
      setPatients(res.data.data.items);
      setTotalPages(res.data.data.totalPages);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetchPatients(); }, [search, page]);

  const handleDelete = async () => {
    try {
      await deletePatient(deleteId);
      setDeleteId(null); fetchPatients();
      toast.success(t("Success"), t("PatientDeleted"));
    } catch { toast.error(t("Error"), t("PatientDeleteFailed")); }
  };

  const Skeleton = () => (
    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(5,150,105,0.08)" }}>
      <div className="w-10 h-10 rounded-2xl animate-pulse shrink-0" style={{ background: "rgba(5,150,105,0.12)" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded-lg animate-pulse w-36" style={{ background: "rgba(5,150,105,0.1)" }} />
        <div className="h-2.5 rounded-lg animate-pulse w-24" style={{ background: "rgba(5,150,105,0.07)" }} />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background: BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px" left="-80px" opacity={0.18} />
      <Orb color="rgba(5,150,105,1)" size="380px" bottom="-60px" right="-60px" opacity={0.13} />
      <Orb color="rgba(14,165,233,1)" size="260px" top="30%" left="50%" opacity={0.09} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">
        {/* Başlıq */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color: "#064e3b" }}>
              {t("Patients")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>{t("TotalPatients")}</p>
          </div>
          <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setEditPatient(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)", boxShadow: "0 4px 18px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">{t("AddPatient")}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        </motion.div>

        {/* Axtarış */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex items-center justify-between gap-3 p-4 rounded-2xl" style={glass}>
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(6,78,59,0.4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={t("Search")}
              className="!bg-transparent !text-black placeholder:!text-gray-400"
            />
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0"
            style={{ background: "rgba(5,150,105,0.1)", border: "1.5px solid rgba(5,150,105,0.2)", color: "#065f46" }}>
            {page}/{totalPages}
          </span>
        </motion.div>

        {/* Cədvəl */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-3xl overflow-hidden" style={glass}>

          {/* Mobil */}
          <div className="md:hidden">
            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />) :
              patients.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(5,150,105,0.1)", border: "1.5px solid rgba(5,150,105,0.2)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="rgba(6,95,70,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="7" r="4" stroke="rgba(6,95,70,0.4)" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "rgba(6,78,59,0.45)" }}>{t("NoData")}</p>
                </div>
              ) : patients.map((p, i) => {
                const g = avatarGrads[(p.firstName?.charCodeAt(0) || 0) % 5];
                return (
                  <motion.div key={p.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                    className="flex items-center gap-3 px-4 py-3.5 transition-all"
                    style={{ borderBottom: "1px solid rgba(5,150,105,0.08)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br ${g}`}>
                      {p.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "#065f46" }}>{p.firstName} {p.lastName}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "rgba(6,78,59,0.5)" }}>{p.email}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {[
                        { onClick: () => setMedicalPatient(p), icon: "🩺", c: "rgba(16,185,129", label: "med" },
                        { onClick: () => { setEditPatient(p); setModalOpen(true); }, icon: null, c: "rgba(56,189,248", label: "edit" },
                        { onClick: () => setDeleteId(p.id), icon: null, c: "rgba(251,113,133", label: "del" },
                      ].map((btn, bi) => (
                        <button key={bi} onClick={btn.onClick}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-xs"
                          style={{ background: `${btn.c},0.12)`, border: `1px solid ${btn.c},0.22)`, color: bi === 0 ? "#059669" : bi === 1 ? "#0ea5e9" : "#fb7185" }}>
                          {btn.icon || (bi === 1 ?
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> :
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            }
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(5,150,105,0.15)" }}>
                  {[`${t("FirstName")} ${t("LastName")}`, t("Email"), t("Phone"), t("Appointments"), t("Actions")].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(6,95,70,0.55)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}>
                    {[140, 160, 100, 60, 100].map((w, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3.5 rounded-lg animate-pulse" style={{ background: "rgba(5,150,105,0.1)", width: w }} />
                      </td>
                    ))}
                  </tr>
                )) : patients.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: "rgba(5,150,105,0.1)", border: "1.5px solid rgba(5,150,105,0.2)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="rgba(6,95,70,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" stroke="rgba(6,95,70,0.4)" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "rgba(6,78,59,0.45)" }}>{t("NoData")}</p>
                  </td></tr>
                ) : patients.map((p, i) => {
                  const g = avatarGrads[(p.firstName?.charCodeAt(0) || 0) % 5];
                  return (
                    <motion.tr key={p.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                      className="transition-all duration-150 cursor-default group"
                      style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br ${g}`}>
                            {p.firstName?.[0]?.toUpperCase()}
                          </div>
                          <p className="text-sm font-bold" style={{ color: "#065f46" }}>{p.firstName} {p.lastName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm" style={{ color: "rgba(6,78,59,0.65)" }}>{p.email}</td>
                      <td className="px-6 py-3.5 text-sm font-mono" style={{ color: "rgba(6,78,59,0.55)" }}>{p.phone || "—"}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold"
                          style={{ background: "rgba(5,150,105,0.12)", border: "1.5px solid rgba(5,150,105,0.22)", color: "#065f46" }}>
                          {p.appointmentCount}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {[
                            { label: "🩺", onClick: () => setMedicalPatient(p), bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.22)", color: "#059669" },
                            { label: t("Edit"), onClick: () => { setEditPatient(p); setModalOpen(true); }, bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.22)", color: "#0ea5e9" },
                            { label: t("Delete"), onClick: () => setDeleteId(p.id), bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)", color: "#fb7185" },
                          ].map((btn, bi) => (
                            <motion.button key={bi} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                              onClick={btn.onClick}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                              style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color }}>
                              {btn.label}
                            </motion.button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ borderTop: "1.5px solid rgba(5,150,105,0.12)" }}>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </motion.div>
      </div>

      <PatientFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} patient={editPatient} onSuccess={fetchPatients} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message={t("DeleteConfirm")} />
      <AnimatePresence>
        {medicalPatient && <MedicalRecordModal patient={medicalPatient} onClose={() => setMedicalPatient(null)} />}
      </AnimatePresence>
    </div>
  );
};
export default PatientsPage;