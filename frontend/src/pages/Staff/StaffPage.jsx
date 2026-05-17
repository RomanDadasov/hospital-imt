import { useEffect, useState } from "react";
import { getStaff, deleteStaff, resetStaffPassword } from "../../api/staffApi";
import Badge from "../../components/common/Badge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StaffFormModal from "./StaffFormModal";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg,#e8faf3 0%,#d0f5e8 35%,#c5f0e0 65%,#daf7ee 100%)";
const glass = {
  background:"rgba(255,255,255,0.62)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
  border:"1px solid rgba(255,255,255,0.88)", boxShadow:"0 4px 24px rgba(5,150,105,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};
const Orb = ({ color, size, top, left, right, bottom, opacity=0.18 }) => (
  <div className="fixed rounded-full pointer-events-none"
    style={{ width:size, height:size, top, left, right, bottom, zIndex:-1,
      background:`radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter:"blur(60px)", opacity }} />
);
const avatarGrads = [
  "from-violet-400 to-purple-500","from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500","from-amber-400 to-orange-500","from-rose-400 to-pink-500",
];
const rowV = {
  hidden:{ opacity:0, y:10 },
  visible:(i)=>({ opacity:1, y:0, transition:{ delay:i*0.04, duration:0.28 } }),
};

const StaffPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [staff, setStaff]           = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetName, setResetName]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try { const res = await getStaff(); setStaff(res.data.data); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async () => {
    try { await deleteStaff(deleteId); setDeleteId(null); fetchStaff(); toast.success(t("Success"), t("StaffDeleted")); }
    catch { toast.error(t("Error"), t("StaffDeleteFailed")); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.warning(t("Warning"), t("PasswordMinLength")); return; }
    if (newPassword !== confirmPassword) { toast.warning(t("Warning"), t("PasswordsNotMatch")); return; }
    setResetLoading(true);
    try {
      await resetStaffPassword(resetUserId, newPassword);
      toast.success(t("Success"), `${resetName} ${t("PasswordReset")}`);
      setResetUserId(null); setNewPassword(""); setConfirmPassword("");
    } catch { toast.error(t("Error"), t("PasswordResetFailed")); }
    finally { setResetLoading(false); }
  };

  const openReset = s => {
    setResetUserId(s.id); setResetName(`${s.firstName} ${s.lastName}`);
    setNewPassword(""); setConfirmPassword(""); setShowPassword(false);
  };

  const iStyle = err => ({
    width:"100%", background:"rgba(255,255,255,0.7)",
    border:`1.5px solid ${err?"rgba(251,113,133,0.55)":"rgba(5,150,105,0.2)"}`,
    borderRadius:14, padding:"10px 14px", color:"rgba(6,46,37,0.9)",
    fontSize:13, outline:"none", fontFamily:"inherit", paddingRight:40,
  });

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background:BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px"  left="-80px"  opacity={0.18} />
      <Orb color="rgba(99,102,241,1)" size="360px" bottom="-60px" right="-60px" opacity={0.1} />
      <Orb color="rgba(14,165,233,1)" size="260px" top="35%" left="50%" opacity={0.09} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">
        {/* Başlıq */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color:"#064e3b" }}>
              {t("Staff")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color:"rgba(6,78,59,0.55)" }}>
              <span className="font-bold" style={{ color:"#059669" }}>{staff.length}</span> {t("Members")}
            </p>
          </div>
          <motion.button whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
            onClick={()=>setModalOpen(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)", boxShadow:"0 4px 18px rgba(16,185,129,0.35)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">{t("AddStaff")}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        </motion.div>

        {/* Kart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-3xl overflow-hidden" style={glass}>
          {loading ? (
            Array.from({length:5}).map((_,i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:"1px solid rgba(5,150,105,0.08)" }}>
                <div className="w-10 h-10 rounded-2xl animate-pulse shrink-0" style={{ background:"rgba(5,150,105,0.12)" }}/>
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-lg animate-pulse w-36" style={{ background:"rgba(5,150,105,0.1)" }}/>
                  <div className="h-2.5 rounded-lg animate-pulse w-24" style={{ background:"rgba(5,150,105,0.07)" }}/>
                </div>
              </div>
            ))
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ background:"rgba(99,102,241,0.1)", border:"1.5px solid rgba(99,102,241,0.22)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color:"rgba(99,102,241,0.6)" }}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color:"rgba(6,78,59,0.6)" }}>{t("NoData")}</p>
                <p className="text-xs mt-1" style={{ color:"rgba(6,78,59,0.4)" }}>{t("AddFirstStaff")}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobil */}
              <div className="md:hidden">
                {staff.map((s, i) => {
                  const g = avatarGrads[(s.firstName?.charCodeAt(0)||0) % avatarGrads.length];
                  return (
                    <motion.div key={s.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                      className="flex items-center gap-3 px-4 py-3.5 transition-all"
                      style={{ borderBottom:"1px solid rgba(5,150,105,0.08)" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(5,150,105,0.05)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {s.profileImageUrl
                        ? <img src={s.profileImageUrl} alt={s.firstName} className="w-10 h-10 rounded-2xl object-cover shrink-0"/>
                        : <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br ${g}`}>
                            {s.firstName?.[0]?.toUpperCase()}
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color:"#065f46" }}>{s.firstName} {s.lastName}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color:"rgba(6,78,59,0.5)" }}>{s.email}</p>
                        <div className="mt-1"><Badge status={s.role}/></div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={()=>openReset(s)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all"
                          style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", color:"#d97706" }}>🔑</button>
                        <button onClick={()=>setDeleteId(s.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all"
                          style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", color:"#fb7185" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom:"1.5px solid rgba(5,150,105,0.15)" }}>
                      {[`${t("FirstName")} ${t("LastName")}`, t("Email"), t("Role"), t("Actions")].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest"
                          style={{ color:"rgba(6,95,70,0.55)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s, i) => {
                      const g = avatarGrads[(s.firstName?.charCodeAt(0)||0) % avatarGrads.length];
                      return (
                        <motion.tr key={s.id} custom={i} variants={rowV} initial="hidden" animate="visible"
                          className="transition-all duration-150 cursor-default group"
                          style={{ borderBottom:"1px solid rgba(5,150,105,0.07)" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(5,150,105,0.05)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              {s.profileImageUrl
                                ? <img src={s.profileImageUrl} alt={s.firstName} className="w-9 h-9 rounded-2xl object-cover shadow-sm shrink-0"/>
                                : <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br ${g}`}>
                                    {s.firstName?.[0]?.toUpperCase()}
                                  </div>
                              }
                              <span className="text-sm font-bold" style={{ color:"#065f46" }}>{s.firstName} {s.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-sm" style={{ color:"rgba(6,78,59,0.65)" }}>{s.email}</td>
                          <td className="px-6 py-3.5"><Badge status={s.role}/></td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button whileHover={{ scale:1.07 }} whileTap={{ scale:0.95 }} onClick={()=>openReset(s)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.28)", color:"#d97706" }}>
                                🔑 {t("Password")}
                              </motion.button>
                              <motion.button whileHover={{ scale:1.07 }} whileTap={{ scale:0.95 }} onClick={()=>setDeleteId(s.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", color:"#fb7185" }}>
                                {t("Delete")}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Şifrə sıfırla modal */}
      <AnimatePresence>
        {resetUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 backdrop-blur-sm" style={{ background:"rgba(5,80,50,0.3)" }}
              onClick={()=>setResetUserId(null)} />
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
              className="relative w-full max-w-md p-6 rounded-3xl z-10"
              style={{ background:"linear-gradient(160deg,#f0fdf6,#e2faf0)", border:"1px solid rgba(200,245,220,0.9)", boxShadow:"0 24px 64px rgba(0,100,60,0.22)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background:"rgba(251,191,36,0.15)", border:"1.5px solid rgba(251,191,36,0.35)" }}>🔑</div>
                <div>
                  <h2 className="text-base font-black" style={{ color:"#064e3b" }}>{t("ResetPassword")}</h2>
                  <p className="text-xs" style={{ color:"rgba(6,78,59,0.5)" }}>{resetName}</p>
                </div>
                <button onClick={()=>setResetUserId(null)} className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background:"rgba(5,150,105,0.1)", border:"1px solid rgba(5,150,105,0.2)", color:"rgba(6,78,59,0.5)" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(251,113,133,0.12)"; e.currentTarget.style.color="#fb7185"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="rgba(5,150,105,0.1)"; e.currentTarget.style.color="rgba(6,78,59,0.5)"; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label:t("NewPassword"), val:newPassword, set:setNewPassword },
                  { label:t("ConfirmPassword"), val:confirmPassword, set:setConfirmPassword },
                ].map((f,fi) => (
                  <div key={fi}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em", color:"rgba(6,95,70,0.6)", marginBottom:6 }}>{f.label}</label>
                    <div className="relative">
                      <input type={showPassword?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)}
                        autoComplete="new-password"
                        style={{ width:"100%", background:"rgba(255,255,255,0.7)", border:`1.5px solid ${fi===1&&f.val&&newPassword!==confirmPassword?"rgba(251,113,133,0.55)":"rgba(5,150,105,0.2)"}`, borderRadius:14, padding:"10px 40px 10px 14px", color:"rgba(6,46,37,0.9)", fontSize:13, outline:"none", fontFamily:"inherit" }}
                        onFocus={e=>{ e.target.style.borderColor="rgba(16,185,129,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(16,185,129,0.1)"; }}
                        onBlur={e=>{ e.target.style.borderColor="rgba(5,150,105,0.2)"; e.target.style.boxShadow="none"; }} />
                      {fi===0 && (
                        <button type="button" onClick={()=>setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-all"
                          style={{ color:"rgba(6,78,59,0.45)" }}>
                          {showPassword?"🙈":"👁️"}
                        </button>
                      )}
                    </div>
                    {fi===1 && confirmPassword && newPassword!==confirmPassword && (
                      <p className="text-xs mt-1" style={{ color:"#fb7185" }}>{t("PasswordsNotMatch")}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={()=>setResetUserId(null)}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold"
                  style={{ background:"rgba(5,150,105,0.07)", border:"1.5px solid rgba(5,150,105,0.18)", color:"rgba(6,78,59,0.65)" }}>
                  {t("Cancel")}
                </button>
                <motion.button onClick={handleResetPassword} disabled={resetLoading}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#fbbf24,#f97316)", boxShadow:"0 4px 16px rgba(251,191,36,0.35)" }}>
                  {resetLoading ? t("Resetting") : t("ResetPassword")}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <StaffFormModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} onSuccess={fetchStaff} />
      <ConfirmDialog isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete} message={t("DeleteConfirm")} />
    </div>
  );
};
export default StaffPage;