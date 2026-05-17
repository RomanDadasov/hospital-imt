import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getTodayQueue, completeAppointment, callNext } from "../../api/queueApi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5171";

const DoctorPanel = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState({});
  const [time, setTime] = useState(new Date());
  const connectionRef = useRef(null);

  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  
  const fetchQueue = async () => {
    try {
      const res = await getTodayQueue();
      setQueue(res.data.data);
    } catch (err) {
      console.error("Queue fetch error:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/queue`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on("QueueUpdated", (state) => {
      setQueue(state);
    });

    connection.start()
      .then(() => connection.invoke("JoinDoctorPanel"))
      .catch(err => console.error("SignalR error:", err));

    connectionRef.current = connection;
    return () => connection.stop();
  }, []);

 
  const handleComplete = async () => {
    if (!queue?.current) return;
    setLoading(prev => ({ ...prev, complete: true }));
    try {
      await completeAppointment(queue.current.id);
      await fetchQueue();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setLoading(prev => ({ ...prev, complete: false }));
    }
  };


  const handleCall = async (appointmentId) => {
    setLoading(prev => ({ ...prev, call: true }));
    try {
      await callNext(appointmentId);
      await fetchQueue();
    } catch (err) {
      console.error("Call error:", err);
    } finally {
      setLoading(prev => ({ ...prev, call: false }));
    }
  };

  const elapsed = queue?.current?.inProgressAt
    ? Math.floor((new Date() - new Date(queue.current.inProgressAt)) / 60000)
    : 0;

  const nextPatient = queue?.waiting?.[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🩺 {t("DoctorPanel")}</h1>
          <p className="text-sm text-slate-400">{time.toLocaleTimeString("az-AZ")}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 text-center">
          <p className="text-amber-600 font-bold text-lg">{queue?.waiting?.length || 0}</p>
          <p className="text-amber-500 text-xs">{t("Waiting")}</p>
        </div>
      </div>

      {/* Cari xəstə */}
      {queue?.current ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100">
          <p className="text-emerald-100 text-sm font-semibold mb-4">🟢 {t("InProgress")}</p>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
              <span className="text-white font-black text-3xl">{queue.current.queueNumber}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-2xl">{t("PatientNumber")} {queue.current.queueNumber}</p>
              <p className="text-emerald-100 text-sm mt-1">{queue.current.departmentName}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-emerald-100 text-xs">{t("ElapsedTime")}</p>
                  <p className="text-white font-bold text-lg">{elapsed} {t("Minutes")}</p>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-emerald-100 text-xs">{t("Next")}</p>
                  <p className="text-white font-bold text-lg">
                    {nextPatient?.queueNumber || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={loading.complete}
            className="w-full mt-6 py-4 bg-white text-emerald-600 font-black text-lg rounded-2xl hover:bg-emerald-50 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading.complete ? "..." : "✓ " + t("CompleteAndNext")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-4xl">⏳</div>
          <p className="text-slate-500 font-semibold">{t("NoCurrentPatient")}</p>
          <p className="text-slate-400 text-sm mt-1">{t("WaitForReception")}</p>
          
          
          {nextPatient && !queue?.current && (
            <button
              onClick={() => handleCall(nextPatient.id)}
              disabled={loading.call}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
            >
              {loading.call ? "..." : "🔊 " + t("CallNextPatient") + " (" + nextPatient.queueNumber + ")"}
            </button>
          )}
        </div>
      )}

      
      {queue?.waiting?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4">⏳ {t("Waiting")} ({queue.waiting.length} {t("People")})</h2>
          <div className="space-y-2">
            {queue.waiting.map((apt, i) => (
              <div 
                key={apt.id} 
                className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? "bg-amber-50 border border-amber-100" : "bg-slate-50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {apt.queueNumber}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{i === 0 ? t("Next") : `${i + 1}. ${t("InQueue")}`}</p>
                    <p className="text-xs text-slate-400">~{apt.estimatedWaitMinutes} {t("MinutesWait")}</p>
                  </div>
                </div>
                
               
                {i === 0 && !queue?.current && (
                  <button
                    onClick={() => handleCall(apt.id)}
                    disabled={loading.call}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    {loading.call ? "..." : "🔊 " + t("Call")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPanel;