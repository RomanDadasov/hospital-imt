import { useEffect, useState } from "react";
import { getAppointments, changeAppointmentStatus, deleteAppointment, downloadAppointmentPdf, downloadAppointmentDocx } from "../../api/appointmentApi";
import { getDoctors } from "../../api/doctorApi";
import { uploadAttachment, downloadAttachment } from "../../api/attachmentApi";
import { downloadReceipt } from "../../api/paymentApi";
import Badge from "../../components/common/Badge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AppointmentFormModal from "./AppointmentFormModal";
import PaymentModal from "../Payments/PaymentModal";
import { formatDateTime } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";

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

const PaymentBadge = ({ status, transactionId }) => {
  const { t } = useTranslation();
  if (!status) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
      style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", color:"#92400e" }}>⏳ {t("Unpaid")}</span>
  );
  if (status==="Paid") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium" title={transactionId}
      style={{ background:"rgba(5,150,105,0.12)", border:"1px solid rgba(5,150,105,0.25)", color:"#065f46" }}>✓ {t("Paid")}</span>
  );
  if (status==="Failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
      style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", color:"#fb7185" }}>✕ {t("Failed")}</span>
  );
  return null;
};

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const tabs = ["All","Upcoming","Completed","Cancelled","Pending"];
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter]     = useState("");
  const [doctors, setDoctors]           = useState([]);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [modalOpen, setModalOpen]       = useState(false);
  const [deleteId, setDeleteId]         = useState(null);
  const [uploadingId, setUploadingId]   = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [paymentApt, setPaymentApt]     = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize:10, status:activeTab==="All"?undefined:activeTab, doctorId:doctorFilter||undefined };
      if (dateFilter) { params.dateFrom=`${dateFilter}T00:00:00.000Z`; params.dateTo=`${dateFilter}T23:59:59.999Z`; }
      const res = await getAppointments(params);
      setAppointments(res.data.data.items); setTotalPages(res.data.data.totalPages);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAppointments(); }, [activeTab, doctorFilter, dateFilter, page]);

  const handleDoctorFilterOpen = async () => {
    if (doctorsLoaded) return;
    try { const res = await getDoctors({ pageSize:100 }); setDoctors(res.data.data.items); setDoctorsLoaded(true); } catch {}
  };
  const handleDelete = async () => {
    try { await deleteAppointment(deleteId); setDeleteId(null); fetchAppointments(); toast.success(t("Success"), t("AppointmentDeleted")); }
    catch { toast.error(t("Error"), t("AppointmentDeleteFailed")); }
  };
  const handleStatusChange = async (id, status) => {
    try { await changeAppointmentStatus(id, { status }); fetchAppointments(); toast.success(t("Success"), `${t("StatusChanged")}: ${status}`); }
    catch { toast.error(t("Error"), t("StatusChangeFailed")); }
  };
  const handleFileUpload = async (appointmentId, file) => {
    if (!file) return;
    setUploadingId(appointmentId);
    const fd = new FormData(); fd.append("file", file);
    try { await uploadAttachment(appointmentId, fd); fetchAppointments(); } catch {} finally { setUploadingId(null); }
  };
  const handleDownloadAttachment = async (appointmentId, attachmentId, fileName, contentType) => {
    try {
      const res = await downloadAttachment(appointmentId, attachmentId);
      const blob = new Blob([res.data], { type:contentType });
      const url = window.URL.createObjectURL(blob);
      if (contentType==="application/pdf") window.open(url,"_blank");
      else { const a=document.createElement("a"); a.href=url; a.download=fileName; a.click(); }
      setTimeout(()=>window.URL.revokeObjectURL(url),1000);
    } catch {}
  };
  const handleDownloadPdf  = async id => { try { const r=await downloadAppointmentPdf(id); const u=window.URL.createObjectURL(new Blob([r.data],{type:"application/pdf"})); window.open(u,"_blank"); setTimeout(()=>window.URL.revokeObjectURL(u),1000); } catch {} };
  const handleDownloadDocx = async id => { try { const r=await downloadAppointmentDocx(id); const u=window.URL.createObjectURL(new Blob([r.data])); const a=document.createElement("a"); a.href=u; a.download=`appointment-${id.slice(0,8)}.docx`; a.click(); setTimeout(()=>window.URL.revokeObjectURL(u),1000); } catch {} };
  const handleDownloadReceipt = async appointmentId => {
    setReceiptLoading(appointmentId);
    try { const r=await downloadReceipt(appointmentId); const u=window.URL.createObjectURL(new Blob([r.data],{type:"application/pdf"})); window.open(u,"_blank"); setTimeout(()=>window.URL.revokeObjectURL(u),1000); }
    catch {} finally { setReceiptLoading(null); }
  };

  const inputCls = "px-3 py-2 rounded-xl text-xs outline-none transition-all";
  const inputSt = { background:"rgba(255,255,255,0.6)", border:"1.5px solid rgba(5,150,105,0.2)", color:"rgba(6,78,59,0.8)" };

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background:BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px"  left="-80px"  opacity={0.18} />
      <Orb color="rgba(14,165,233,1)" size="360px" bottom="-60px" right="-60px" opacity={0.12} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">
        {/* Başlıq */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color:"#064e3b" }}>
              {t("Appointments")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5 hidden sm:block" style={{ color:"rgba(6,78,59,0.55)" }}>
              {t("AppointmentsDescription")}
            </p>
          </div>
          <motion.button whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }} onClick={()=>setModalOpen(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)", boxShadow:"0 4px 18px rgba(16,185,129,0.35)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="hidden sm:inline">{t("CreateAppointment")}</span>
            <span className="sm:hidden">+</span>
          </motion.button>
        </motion.div>

        {/* Filter paneli */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="p-4 rounded-2xl space-y-3" style={glass}>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex gap-1 p-1 w-fit min-w-max rounded-2xl" style={{ background:"rgba(5,150,105,0.08)" }}>
              {tabs.map(tab => (
                <button key={tab} onClick={()=>{ setActiveTab(tab); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                  style={activeTab===tab
                    ? { background:"rgba(255,255,255,0.8)", color:"#065f46", boxShadow:"0 2px 8px rgba(5,150,105,0.15)" }
                    : { color:"rgba(6,78,59,0.5)" }}>
                  {t(tab)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button whileHover={{ scale:1.03 }} onClick={()=>{ setDateFilter(new Date().toISOString().split("T")[0]); setPage(1); }}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background:"rgba(5,150,105,0.12)", border:"1.5px solid rgba(5,150,105,0.25)", color:"#065f46" }}>
              📅 {t("Today")}
            </motion.button>
            {dateFilter && (
              <button onClick={()=>{ setDateFilter(""); setPage(1); }}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={{ background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.2)", color:"#fb7185" }}>✕</button>
            )}
            <input type="date" value={dateFilter} onChange={e=>{ setDateFilter(e.target.value); setPage(1); }}
              className={`${inputCls} flex-1 min-w-0`} style={inputSt}
              onFocus={e=>e.target.style.borderColor="rgba(16,185,129,0.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(5,150,105,0.2)"} />
            <select value={doctorFilter} onFocus={handleDoctorFilterOpen} onChange={e=>{ setDoctorFilter(e.target.value); setPage(1); }}
              className={`${inputCls} flex-1 min-w-0`} style={inputSt}>
              <option value="" style={{ background:"#e8faf3" }}>{t("AllDoctors")}</option>
              {doctors.map(d => <option key={d.id} value={d.id} style={{ background:"#e8faf3" }}>{d.fullName}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Randevular */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({length:5}).map((_,i) => (
              <div key={i} className="p-4 rounded-2xl animate-pulse" style={{ background:"rgba(255,255,255,0.5)", border:"1px solid rgba(5,150,105,0.12)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl shrink-0" style={{ background:"rgba(5,150,105,0.12)" }}/>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded-lg w-40" style={{ background:"rgba(5,150,105,0.1)" }}/>
                    <div className="h-3 rounded-lg w-32" style={{ background:"rgba(5,150,105,0.07)" }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt, idx) => {
              const isExpanded = expandedId === apt.id;
              const isPaid = apt.paymentStatus === "Paid";
              const isUnpaid = !apt.paymentStatus || apt.paymentStatus === "Failed";
              return (
                <motion.div key={apt.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:idx*0.04 }}
                  className="rounded-2xl overflow-hidden transition-shadow"
                  style={{ ...glass, ...(isPaid ? { borderColor:"rgba(5,150,105,0.35)" } : {}),
                    boxShadow:isPaid?"0 4px 20px rgba(5,150,105,0.14)":"0 4px 16px rgba(5,150,105,0.08)" }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 28px rgba(5,150,105,0.15)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow=isPaid?"0 4px 20px rgba(5,150,105,0.14)":"0 4px 16px rgba(5,150,105,0.08)"}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
                          style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)", boxShadow:"0 3px 12px rgba(16,185,129,0.3)" }}>
                          {apt.patientName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color:"#065f46" }}>{apt.patientName}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color:"rgba(6,78,59,0.55)" }}>{apt.doctorName} · {apt.departmentName}</p>
                          <p className="text-xs font-semibold mt-0.5" style={{ color:"#059669" }}>{formatDateTime(apt.appointmentDate)}</p>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <PaymentBadge status={apt.paymentStatus} transactionId={apt.paymentTransactionId} />
                            {isPaid && (
                              <button onClick={()=>handleDownloadReceipt(apt.id)} disabled={receiptLoading===apt.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                                style={{ background:"rgba(5,150,105,0.1)", border:"1px solid rgba(5,150,105,0.22)", color:"#065f46" }}>
                                {receiptLoading===apt.id?"...":"🧾"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge status={apt.status}/>
                        <div className="flex items-center gap-1.5">
                          {apt.status==="Pending" && (
                            <>
                              {isUnpaid && (
                                <motion.button whileHover={{ scale:1.08 }} onClick={()=>setPaymentApt(apt)}
                                  className="text-xs px-2.5 py-1.5 rounded-xl font-semibold text-white"
                                  style={{ background:"linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow:"0 2px 10px rgba(139,92,246,0.35)" }}>
                                  💳
                                </motion.button>
                              )}
                              <motion.button whileHover={{ scale:1.08 }} onClick={()=>handleStatusChange(apt.id,"Cancelled")}
                                className="text-xs px-2.5 py-1.5 rounded-xl font-semibold"
                                style={{ background:"rgba(251,113,133,0.12)", border:"1px solid rgba(251,113,133,0.25)", color:"#fb7185" }}>✕</motion.button>
                            </>
                          )}
                          {apt.status==="Confirmed" && (
                            <motion.button whileHover={{ scale:1.08 }} onClick={()=>handleStatusChange(apt.id,"Completed")}
                              className="text-xs px-2.5 py-1.5 rounded-xl font-semibold"
                              style={{ background:"rgba(5,150,105,0.12)", border:"1px solid rgba(5,150,105,0.25)", color:"#065f46" }}>✓</motion.button>
                          )}
                          <button onClick={()=>setExpandedId(isExpanded?null:apt.id)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                            style={{ background:"rgba(5,150,105,0.08)", border:"1px solid rgba(5,150,105,0.15)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                              className={`transition-transform ${isExpanded?"rotate-180":""}`} style={{ color:"rgba(6,78,59,0.5)" }}>
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button onClick={()=>setDeleteId(apt.id)}
                            className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                            style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color:"#fb7185" }}>
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                        className="mt-3 pt-3 flex items-center gap-2 flex-wrap"
                        style={{ borderTop:"1.5px solid rgba(5,150,105,0.12)" }}>
                        <label className={`flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-xl font-semibold transition-all ${uploadingId===apt.id?"opacity-50 pointer-events-none":""}`}
                          style={{ background:"rgba(5,150,105,0.1)", border:"1.5px solid rgba(5,150,105,0.22)", color:"#065f46" }}>
                          📎 {uploadingId===apt.id?t("Uploading"):t("AttachFile")}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.zip"
                            onChange={e=>handleFileUpload(apt.id,e.target.files[0])} className="hidden" disabled={uploadingId===apt.id}/>
                        </label>
                        <button onClick={()=>handleDownloadPdf(apt.id)}
                          className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                          style={{ background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", color:"#fb7185" }}>⬇ PDF</button>
                        <button onClick={()=>handleDownloadDocx(apt.id)}
                          className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                          style={{ background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.22)", color:"#0ea5e9" }}>⬇ DOCX</button>
                        {apt.attachments?.map(att => (
                          <div key={att.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                            style={{ background:"rgba(255,255,255,0.6)", border:"1px solid rgba(5,150,105,0.15)" }}>
                            <span className="text-xs truncate max-w-24" style={{ color:"rgba(6,78,59,0.7)" }}>📄 {att.originalFileName}</span>
                            <button onClick={()=>handleDownloadAttachment(apt.id,att.id,att.originalFileName,att.contentType)}
                              className="text-xs ml-1" style={{ color:"#0ea5e9" }}>⬇</button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {appointments.length === 0 && (
              <div className="py-14 text-center rounded-2xl" style={glass}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
                  style={{ background:"rgba(5,150,105,0.1)", border:"1.5px solid rgba(5,150,105,0.2)" }}>📅</div>
                <p className="text-sm font-medium" style={{ color:"rgba(6,78,59,0.45)" }}>{t("NoData")}</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background:"rgba(255,255,255,0.6)", border:"1.5px solid rgba(5,150,105,0.18)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color:"rgba(6,78,59,0.6)" }}><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            {Array.from({ length:Math.min(totalPages,5) },(_,i)=>{ const p=totalPages<=5?i+1:page<=3?i+1:page>=totalPages-2?totalPages-4+i:page-2+i; return (
              <button key={p} onClick={()=>setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                style={page===p
                  ? { background:"linear-gradient(135deg,#10b981,#0ea5e9)", color:"white", boxShadow:"0 3px 12px rgba(16,185,129,0.4)" }
                  : { background:"rgba(255,255,255,0.6)", border:"1.5px solid rgba(5,150,105,0.18)", color:"rgba(6,78,59,0.7)" }}>
                {p}
              </button>
            ); })}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background:"rgba(255,255,255,0.6)", border:"1.5px solid rgba(5,150,105,0.18)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color:"rgba(6,78,59,0.6)" }}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}
      </div>

      <AppointmentFormModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} onSuccess={fetchAppointments}/>
      <ConfirmDialog isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={handleDelete} message={t("DeleteConfirm")}/>
      <PaymentModal isOpen={!!paymentApt} onClose={()=>setPaymentApt(null)} appointment={paymentApt}
        onSuccess={()=>{ setPaymentApt(null); fetchAppointments(); }}/>
    </div>
  );
};
export default AppointmentsPage;