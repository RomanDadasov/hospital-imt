import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getTodayQueue, addToQueue, callNext, completeAppointment } from "../../api/queueApi";
import { getAppointments } from "../../api/appointmentApi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5171";

const QueueManagement = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState(null);
  const [paidAppointments, setPaidAppointments] = useState([]);
  const [loading, setLoading] = useState({});
  const connectionRef = useRef(null);

  const fetchQueue = async () => {
    const res = await getTodayQueue();
    setQueue(res.data.data);
  };

 const fetchPaidAppointments = async () => {

  const res = await getAppointments({
    pageSize: 100,
    status: "Confirmed",
  });
  
  console.log("Confirmed appointments (all dates):", res.data.data.items);
  
  const items = (res.data.data.items || []).filter(
    (a) => a.paymentStatus === "Paid" && !a.queueNumber
  );
  
  console.log("Paid + Confirmed (no queue):", items);
  setPaidAppointments(items);
};

  useEffect(() => {
    fetchQueue();
    fetchPaidAppointments();
  }, []);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/queue`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on("QueueUpdated", (state) => {
      setQueue(state);
      fetchPaidAppointments();
    });

    connection.start().then(() => connection.invoke("JoinReceptionPanel"));
    connectionRef.current = connection;
    return () => connection.stop();
  }, []);

  const handleAction = async (id, action) => {
    setLoading((p) => ({ ...p, [id]: true }));
    try { await action(id); } catch {}
    finally { setLoading((p) => ({ ...p, [id]: false })); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🏥 {t("QueueManagement")}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{t("TodayQueue")}</p>
        </div>
        <a href="/queue-display" target="_blank"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          📺 {t("TVDisplay")}
        </a>
      </div>


      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t("Total"), value: queue?.totalToday || 0, color: "text-slate-800", bg: "bg-white" },
          { label: t("Waiting"), value: queue?.waiting?.length || 0, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t("InProgress"), value: queue?.current ? 1 : 0, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: t("Completed"), value: queue?.completed?.length || 0, color: "text-sky-600", bg: "bg-sky-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center text-xs">+</span>
            {t("AddToQueue")}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {paidAppointments.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">{t("NoPatientsToAdd")}</p>
            ) : paidAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                  {apt.patientName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{apt.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{apt.doctorName}</p>
                </div>
                <button
                  onClick={() => handleAction(apt.id, addToQueue)}
                  disabled={loading[apt.id]}
                  className="shrink-0 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  {loading[apt.id] ? "..." : "➕ " + t("AddToQueue")}
                </button>
              </div>
            ))}
          </div>
        </div>

    
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-xs">📋</span>
            {t("QueueList")}
          </h2>

       
          {queue?.current && (
            <div className="mb-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                    {queue.current.queueNumber}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-bold">🟢 {t("InProgress")}</p>
                    <p className="text-sm font-semibold text-slate-800">{t("Dr")} {queue.current.doctorName}</p>
                    <p className="text-xs text-slate-400">{queue.current.departmentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(queue.current.id, completeAppointment)}
                  disabled={loading[queue.current.id]}
                  className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                  {loading[queue.current.id] ? "..." : "✓ " + t("Complete")}
                </button>
              </div>
            </div>
          )}

        
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {queue?.waiting?.length === 0 && !queue?.current && (
              <p className="text-slate-400 text-sm text-center py-8">{t("EmptyQueue")}</p>
            )}
            {queue?.waiting?.map((apt, i) => (
              <div key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {apt.queueNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-600">{i === 0 ? "⏭ " + t("Next") : `${i + 1}. ${t("InQueue")}`}</p>
                  <p className="text-xs text-slate-400 truncate">{t("Dr")} {apt.doctorName}</p>
                  <p className="text-xs text-slate-300">~{apt.estimatedWaitMinutes} {t("Minutes")}</p>
                </div>
                {i === 0 && !queue?.current && (
                  <button
                    onClick={() => handleAction(apt.id, callNext)}
                    disabled={loading[apt.id]}
                    className="shrink-0 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    {loading[apt.id] ? "..." : "🔊 " + t("Call")}
                  </button>
                )}
              </div>
            ))}
          </div>

         
          {queue?.completed?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">{t("Completed")}</p>
              <div className="flex flex-wrap gap-2">
                {queue.completed.map((apt) => (
                  <span key={apt.id} className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-lg">
                    ✓ {apt.queueNumber}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;