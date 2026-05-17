import { useEffect, useState } from "react";
import { getDepartments, deleteDepartment } from "../../api/departmentApi";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DepartmentFormModal from "./DepartmentFormModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { optimizeImage } from "../../utils/cloudinary";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg,#e8faf3 0%,#d0f5e8 35%,#c5f0e0 65%,#daf7ee 100%)";
const glass = {
  background:"rgba(255,255,255,0.62)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
  border:"1px solid rgba(255,255,255,0.88)", boxShadow:"0 4px 24px rgba(5,150,105,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};
const Orb = ({ color, size, top, left, right, bottom, opacity=0.18 }) => (
  <div className="fixed rounded-full pointer-events-none"
    style={{ width:size, height:size, top, left, right, bottom, zIndex:-1,
      background:`radial-gradient(circle, ${color} 0%, transparent 70%)`, filter:"blur(60px)", opacity }} />
);

const cardAccents = [
  { border:"rgba(251,113,133,0.35)", bg:"rgba(251,113,133,0.1)",  badge:"rgba(220,38,38,0.12)", badgeBorder:"rgba(220,38,38,0.25)",   badgeColor:"#b91c1c"  },
  { border:"rgba(56,189,248,0.35)",  bg:"rgba(56,189,248,0.1)",   badge:"rgba(2,132,199,0.12)",  badgeBorder:"rgba(2,132,199,0.25)",    badgeColor:"#0369a1"  },
  { border:"rgba(52,211,153,0.35)",  bg:"rgba(52,211,153,0.1)",   badge:"rgba(5,150,105,0.12)",  badgeBorder:"rgba(5,150,105,0.25)",    badgeColor:"#065f46"  },
  { border:"rgba(251,191,36,0.35)",  bg:"rgba(251,191,36,0.1)",   badge:"rgba(217,119,6,0.12)",  badgeBorder:"rgba(217,119,6,0.25)",    badgeColor:"#92400e"  },
  { border:"rgba(167,139,250,0.35)", bg:"rgba(167,139,250,0.1)",  badge:"rgba(124,58,237,0.12)", badgeBorder:"rgba(124,58,237,0.25)",   badgeColor:"#5b21b6"  },
  { border:"rgba(99,102,241,0.35)",  bg:"rgba(99,102,241,0.1)",   badge:"rgba(67,56,202,0.12)",  badgeBorder:"rgba(67,56,202,0.25)",    badgeColor:"#3730a3"  },
];

const DepartmentsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editDept, setEditDept]       = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [loading, setLoading]         = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try { const res = await getDepartments(); setDepartments(res.data.data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchDepts(); }, []);

  const handleDelete = async () => {
    try { await deleteDepartment(deleteId); setDeleteId(null); fetchDepts(); toast.success(t("Success"), t("DepartmentDeleted")); }
    catch { toast.error(t("Error"), t("DepartmentDeleteFailed")); }
  };

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background:BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px"  left="-80px"  opacity={0.18} />
      <Orb color="rgba(99,102,241,1)" size="360px" bottom="-60px" right="-60px" opacity={0.1} />
      <Orb color="rgba(251,191,36,1)" size="240px" top="40%" left="55%" opacity={0.08} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">
        {/* Başlıq */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color:"#064e3b" }}>
              {t("Departments")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color:"rgba(6,78,59,0.55)" }}>
              <span className="font-bold" style={{ color:"#059669" }}>{departments.length}</span> {t("Departments")}
            </p>
          </div>
          <motion.button whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
            onClick={()=>{ setEditDept(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)", boxShadow:"0 4px 18px rgba(16,185,129,0.35)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">{t("AddDepartment")}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background:"rgba(255,255,255,0.5)", border:"1px solid rgba(5,150,105,0.12)" }}>
                <div className="h-36" style={{ background:"rgba(5,150,105,0.1)" }}/>
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded-lg w-3/4" style={{ background:"rgba(5,150,105,0.1)" }}/>
                  <div className="h-3 rounded-lg w-full" style={{ background:"rgba(5,150,105,0.07)" }}/>
                </div>
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl" style={glass}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background:"rgba(5,150,105,0.1)", border:"1.5px solid rgba(5,150,105,0.22)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ color:"rgba(5,150,105,0.5)" }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color:"rgba(6,78,59,0.6)" }}>{t("NoData")}</p>
              <p className="text-xs mt-1" style={{ color:"rgba(6,78,59,0.4)" }}>{t("AddFirstDepartment")}</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {departments.map((dept, i) => {
                const a = cardAccents[i % cardAccents.length];
                return (
                  <motion.div key={dept.id}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.06 }} whileHover={{ y:-4 }}
                    className="group rounded-2xl overflow-hidden transition-all"
                    style={{ ...glass, border:`1.5px solid ${a.border}` }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 8px 32px ${a.border}`}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow=glass.boxShadow}>

                    {/* Şəkil */}
                    <div className="h-36 overflow-hidden relative"
                      style={{ background:a.bg }}>
                      {dept.imageUrl ? (
                        <img src={optimizeImage(dept.imageUrl,600,300)} alt={dept.name}
                          loading="lazy" decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color:a.badgeColor, opacity:0.4 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="p-4">
                      <h3 className="font-black text-sm mb-1.5" style={{ color:"#065f46" }}>{dept.name}</h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color:"rgba(6,78,59,0.55)" }}>
                        {dept.description || "—"}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3"
                        style={{ borderTop:`1.5px solid ${a.border}` }}>
                        <span className="text-xs font-semibold px-3 py-1 rounded-xl"
                          style={{ background:a.badge, border:`1px solid ${a.badgeBorder}`, color:a.badgeColor }}>
                          {dept.doctorCount} {t("Doctors")}
                        </span>
                        <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                          <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
                            onClick={()=>{ setEditDept(dept); setModalOpen(true); }}
                            className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                            style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.22)", color:"#0ea5e9" }}>
                            {t("Edit")}
                          </motion.button>
                          <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
                            onClick={()=>setDeleteId(dept.id)}
                            className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                            style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", color:"#fb7185" }}>
                            {t("Delete")}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <DepartmentFormModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} department={editDept} onSuccess={fetchDepts}/>
      <ConfirmDialog isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete} message={t("DeleteConfirm")}/>
    </div>
  );
};
export default DepartmentsPage;