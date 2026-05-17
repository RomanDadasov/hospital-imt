import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { useTranslation } from "react-i18next";

const severityColor = {
  mild: "bg-green-500/20 text-green-600 border-green-500/30",
  moderate: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  severe: "bg-rose-500/20 text-rose-600 border-rose-500/30",
};

const AppointmentRequestsPage = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const severityLabel = { mild: t("Mild"), moderate: t("Moderate"), severe: t("Severe") };

  const fetchRequests = async () => {
    setLoading(true);
    try { const res = await axios.get("/appointment-requests"); setRequests(res.data.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const markAsRead = async (id) => {
    try { await axios.patch(`/appointment-requests/${id}/read`); await fetchRequests(); } catch { }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/appointment-requests/${id}`); setRequests((prev) => prev.filter((r) => r.id !== id)); setDeleteId(null); }
    catch { }
  };

  const unreadCount = requests.filter(r => !r.isRead).length;

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">{t("AppointmentRequests")}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {unreadCount > 0 ? <span className="text-teal-500 font-semibold">{unreadCount} {t("Unread")}</span> : t("AllRead")} · {requests.length} {t("Total")}
          </p>
        </div>
        <button onClick={fetchRequests}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">{t("Refresh")}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-40" />
                  <div className="h-2.5 bg-gray-100 rounded-lg animate-pulse w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-3xl">📅</p>
            <p className="text-sm font-bold text-slate-500">{t("NoAppointmentRequests")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map((r) => (
              <div key={r.id} className={`px-4 py-4 transition-colors hover:bg-gray-50/50 ${!r.isRead ? "bg-teal-50/30" : "bg-white"}`}>
                <div className="flex items-start gap-3">
                 
                  <div className="shrink-0 mt-2">
                    {!r.isRead
                      ? <span className="w-2 h-2 rounded-full bg-teal-400 block animate-pulse" />
                      : <span className="w-2 h-2 rounded-full bg-gray-200 block" />}
                  </div>

                
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.patientName?.[0]?.toUpperCase()}
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-slate-800">{r.patientName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${severityColor[r.severity] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {severityLabel[r.severity] || r.severity}
                      </span>
                      {!r.isRead && <span className="text-xs bg-teal-500/15 text-teal-600 border border-teal-500/25 px-2 py-0.5 rounded-lg font-semibold">{t("New")}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-2">
                      <span>📞 {r.patientPhone}</span>
                      <span>🏥 {r.bodyRegion}</span>
                      <span className="hidden sm:inline">👨‍⚕️ {r.doctorName}</span>
                    </div>
                    {r.message && (
                      <div className="text-xs text-slate-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 mb-2">
                        💬 {r.message}
                      </div>
                    )}
                    <p className="text-xs text-slate-300">{new Date(r.createdAt).toLocaleString("az-AZ")}</p>

                    
                    <div className="flex gap-2 mt-3 md:hidden flex-wrap">
                      {!r.isRead && (
                        <button onClick={() => markAsRead(r.id)}
                          className="text-xs bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-medium border border-teal-100">
                          ✓ {t("MarkAsRead")}
                        </button>
                      )}
                      <a href={`tel:${r.patientPhone}`}
                        className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium border border-emerald-100">
                        📞 {t("Call")}
                      </a>
                      <button onClick={() => setDeleteId(r.id)}
                        className="text-xs bg-rose-50 text-rose-500 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-medium border border-rose-100">
                        🗑
                      </button>
                    </div>
                  </div>

                
                  <div className="hidden md:flex flex-col gap-2 shrink-0">
                    {!r.isRead && (
                      <button onClick={() => markAsRead(r.id)}
                        className="text-xs bg-teal-50 text-teal-600 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-medium border border-teal-100 whitespace-nowrap">
                        ✓ {t("MarkAsRead")}
                      </button>
                    )}
                    <a href={`tel:${r.patientPhone}`}
                      className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium border border-emerald-100 text-center whitespace-nowrap">
                      📞 {t("Call")}
                    </a>
                    <button onClick={() => setDeleteId(r.id)}
                      className="text-xs bg-rose-50 text-rose-500 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-medium border border-rose-100 whitespace-nowrap">
                      🗑 {t("Delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-rose-500">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-center font-bold text-slate-800 mb-1">{t("DeleteConfirmTitle")}</p>
            <p className="text-center text-sm text-slate-400 mb-5">{t("DeleteConfirmDesc")}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-gray-50">{t("Cancel")}</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold">{t("Delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentRequestsPage;