import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getMyAppointments, changeAppointmentStatus } from "../../api/appointmentApi";
import Badge from "../../components/common/Badge";
import { formatDateTime } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import PrescriptionModal from "../Prescriptions/PrescriptionModal";

const MyAppointmentsPage = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [prescriptionApt, setPrescriptionApt] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 20;

  const tabs = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const fetchAppointments = async (resetPage = true) => {
    const currentPage = resetPage ? 1 : page + 1;
    if (resetPage) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = { page: currentPage, pageSize: PAGE_SIZE };
      if (activeTab !== "All") params.status = activeTab;
      const res = await getMyAppointments(params);
      const newItems = res.data.data;
      if (resetPage) { setAppointments(newItems); setPage(1); }
      else { setAppointments((prev) => [...prev, ...newItems]); setPage(currentPage); }
      setHasMore(newItems.length === PAGE_SIZE);
    } catch { } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { fetchAppointments(true); }, [activeTab]);

  const handleComplete = async (id) => {
    try { await changeAppointmentStatus(id, { status: "Completed" }); fetchAppointments(true); } catch { }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">{t("MyAppointments")}</h1>
        <p className="text-sm text-slate-400 mt-0.5">{appointments.length} randevu</p>
      </div>

      
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 w-fit border border-gray-100 min-w-max">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab
                ? "bg-white text-emerald-600 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-600"}`}>
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
                  <div className="h-3 bg-gray-50 rounded animate-pulse w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-emerald-100 flex-shrink-0">
                    {apt.patientName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{apt.patientName}</p>
                    <p className="text-xs text-emerald-500 font-medium mt-0.5">{formatDateTime(apt.appointmentDate)}</p>
                    {apt.departmentName && <p className="text-xs text-slate-400 mt-0.5">{apt.departmentName}</p>}
                    {apt.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 bg-slate-50 px-2 py-1 rounded-lg inline-block">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge status={apt.status} />
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {(apt.status === "Confirmed" || apt.status === "Completed" || apt.status === "InProgress") && (
                      <button onClick={() => setPrescriptionApt(apt)}
                        className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-100 px-2 py-1 rounded-lg font-medium transition-colors">
                        💊
                      </button>
                    )}
                    {apt.status === "Confirmed" && (
                      <button onClick={() => handleComplete(apt.id)}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-lg font-medium transition-colors">
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-slate-400 text-sm font-medium">{t("noData")}</p>
            </div>
          )}

          {hasMore && (
            <button onClick={() => fetchAppointments(false)} disabled={loadingMore}
              className="w-full py-3 bg-white border border-gray-200 text-slate-500 text-sm font-medium rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loadingMore ? (
                <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Loading...</>
              ) : "↓ Daha çox yüklə"}
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {prescriptionApt && (
          <PrescriptionModal appointment={prescriptionApt} onClose={() => setPrescriptionApt(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAppointmentsPage;