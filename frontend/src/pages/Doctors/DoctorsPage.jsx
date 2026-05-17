import { useEffect, useState } from "react";
import { getDoctors, deleteDoctor } from "../../api/doctorApi";
import { getDepartments } from "../../api/departmentApi";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DoctorFormModal from "./DoctorFormModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

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
      width: size,
      height: size,
      top,
      left,
      right,
      bottom,
      zIndex: -1,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(60px)",
      opacity
    }}
  />
);

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

const DoctorsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors({
        searchTerm: search,
        departmentId: deptFilter || undefined,
        page,
        pageSize: 10
      });
      setDoctors(res.data.data.items);
      setTotalPages(res.data.data.totalPages);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, [search, deptFilter, page]);
  useEffect(() => { getDepartments().then((res) => setDepartments(res.data.data)); }, []);

  const handleDelete = async () => {
    try {
      await deleteDoctor(deleteId);
      setDeleteId(null);
      fetchDoctors();
      toast.success(t("Success"), t("DoctorDeleted"));
    } catch {
      toast.error(t("Error"), t("DoctorDeleteFailed"));
    }
  };

  const SkeletonRow = () => (
    <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid rgba(5,150,105,0.08)" }}>
      <div className="w-11 h-11 rounded-2xl shrink-0 animate-pulse" style={{ background: "rgba(5,150,105,0.12)" }} />
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
              {t("Doctors")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>
              {t("TotalDoctors")}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setEditDoctor(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#10b981,#0ea5e9)",
              boxShadow: "0 4px 18px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">{t("AddDoctor")}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        </motion.div>

        {/* Axtarış + Filtr */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex flex-wrap items-center gap-3 p-4 rounded-2xl" style={glass}>

          <div className="flex-1 min-w-[180px] relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(6,78,59,0.45)" }}>
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

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium outline-none min-w-[160px]"
            style={{
              background: "rgba(5,150,105,0.08)",
              border: "1px solid rgba(5,150,105,0.2)",
              color: "#065f46"
            }}
          >
            <option value="">{t("AllDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Cədvəl */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-3xl overflow-hidden" style={glass}>

          {/* Mobil */}
          <div className="md:hidden">
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
              doctors.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm" style={{ color: "rgba(6,78,59,0.5)" }}>{t("NoData")}</p>
                </div>
              ) : doctors.map((doc, i) => (
                <motion.div key={doc.id} custom={i} variants={rowVariants} initial="hidden" animate="visible"
                  className="flex items-center gap-3 px-4 py-4 transition-all"
                  style={{ borderBottom: "1px solid rgba(5,150,105,0.08)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Mobil kart - istəsən genişləndirə bilərəm */}
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: "#065f46" }}>{doc.fullName}</p>
                    <p className="text-xs" style={{ color: "rgba(6,78,59,0.6)" }}>
                      {doc.departmentName} · {doc.specialization}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditDoctor(doc); setModalOpen(true); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-sky-600"
                      style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>✏️</button>
                    <button onClick={() => setDeleteId(doc.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-600"
                      style={{ background: "rgba(251,113,133,0.12)", border: "1px solid rgba(251,113,133,0.25)" }}>🗑</button>
                  </div>
                </motion.div>
              ))
            }
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(5,150,105,0.15)" }}>
                  {[t("Doctor"), t("Specialization"), t("Department"), t("Phone"), t("Actions")].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(6,95,70,0.55)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}>
                      {[160, 130, 110, 100, 140].map((w, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3.5 rounded animate-pulse" style={{ background: "rgba(5,150,105,0.1)", width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : doctors.map((doc, i) => (
                  <motion.tr key={doc.id} custom={i} variants={rowVariants} initial="hidden" animate="visible"
                    className="group transition-all"
                    style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                          {doc.fullName?.[0] || "D"}
                        </div>
                        <p className="font-bold" style={{ color: "#065f46" }}>{doc.fullName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "rgba(6,78,59,0.7)" }}>{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "rgba(6,78,59,0.65)" }}>{doc.departmentName || "—"}</td>
                    <td className="px-6 py-4 font-mono text-sm" style={{ color: "rgba(6,78,59,0.55)" }}>{doc.phone || "—"}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setEditDoctor(doc); setModalOpen(true); }}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl"
                          style={{ background: "rgba(56,189,248,0.12)", color: "#0ea5e9", border: "1px solid rgba(56,189,248,0.25)" }}>
                          {t("Edit")}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteId(doc.id)}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl"
                          style={{ background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.25)" }}>
                          {t("Delete")}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "1.5px solid rgba(5,150,105,0.12)" }}>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </motion.div>
      </div>

      <DoctorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        doctor={editDoctor}
        departments={departments}
        onSuccess={fetchDoctors}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message={t("DeleteConfirm")}
      />
    </div>
  );
};

export default DoctorsPage;