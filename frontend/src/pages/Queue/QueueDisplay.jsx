import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getTodayQueue } from "../../api/queueApi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5171";

const QueueDisplay = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState(null);
  const [time, setTime] = useState(new Date());
  const [calling, setCalling] = useState(null);
  const connectionRef = useRef(null);

  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    getTodayQueue().then((res) => setQueue(res.data.data));
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

    connection.on("CallPatient", (data) => {
      setCalling(data);
      speak(`${data.queueNumber} ${t("CallPatientMessage")} ${data.doctorName} ${t("Room")}`);
      setTimeout(() => setCalling(null), 8000);
    });

    connection.start().then(() => {
      connection.invoke("JoinQueueDisplay");
    });

    connectionRef.current = connection;
    return () => connection.stop();
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "az-AZ";
    utter.rate = 0.85;
    utter.pitch = 1;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const azVoice = voices.find(v => v.lang.startsWith("az") || v.lang.startsWith("tr"));
    if (azVoice) utter.voice = azVoice;

    window.speechSynthesis.speak(utter);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (date) =>
    date.toLocaleDateString("az-AZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>

     
      {calling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"/>
          <div className="relative bg-emerald-500 rounded-3xl px-16 py-10 text-center shadow-2xl border-4 border-emerald-300 animate-bounce">
            <p className="text-white text-2xl font-bold mb-2">🔊 {t("Please")}</p>
            <p className="text-white text-7xl font-black tracking-widest mb-2">{calling.queueNumber}</p>
            <p className="text-emerald-100 text-xl">{t("CallPatientDesc")}</p>
            <p className="text-emerald-200 text-sm mt-2">{t("Dr")} {calling.doctorName} · {calling.departmentName}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-2xl">🏥</div>
          <div>
            <p className="text-white font-black text-xl">{t("HospitalManagement")}</p>
            <p className="text-slate-400 text-sm">{t("ElectronicQueue")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-mono text-4xl font-bold">{formatTime(time)}</p>
          <p className="text-slate-400 text-sm capitalize">{formatDate(time)}</p>
        </div>
      </div>

     
      <div className="grid grid-cols-3 gap-0 h-[calc(100vh-80px)]">

       
        <div className="col-span-1 bg-gradient-to-b from-emerald-900/50 to-slate-900 border-r border-slate-700 p-8 flex flex-col">
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-6">🩺 {t("InProgress")}</p>

          {queue?.current ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center">
                  <span className="text-emerald-400 font-black text-6xl">{queue.current.queueNumber}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full animate-ping"/>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full"/>
              </div>
              <p className="text-white text-xl font-bold text-center">{t("PatientNumber")} {queue.current.queueNumber}</p>
              <p className="text-slate-400 text-sm mt-1">{t("Dr")} {queue.current.doctorName}</p>
              <p className="text-slate-500 text-xs mt-0.5">{queue.current.departmentName}</p>

              {queue.current.inProgressAt && (
                <div className="mt-6 bg-slate-800 rounded-xl px-6 py-3 text-center">
                  <p className="text-slate-400 text-xs">{t("StartTime")}</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    {new Date(queue.current.inProgressAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4">
                <span className="text-4xl">⏳</span>
              </div>
              <p className="text-slate-500 text-center">{t("NoCurrentPatient")}</p>
            </div>
          )}
        </div>

       
        <div className="col-span-1 border-r border-slate-700 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <p className="text-amber-400 text-sm font-bold uppercase tracking-widest">⏳ {t("Waiting")}</p>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              {queue?.waiting?.length || 0} {t("People")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {queue?.waiting?.length > 0 ? queue.waiting.map((apt, i) => (
              <div key={apt.id} className={`rounded-2xl p-4 border transition-all ${i === 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-800/50 border-slate-700/50"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 ${i === 0 ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                    {apt.queueNumber}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${i === 0 ? "text-amber-400" : "text-slate-300"}`}>
                      {i === 0 ? "🔔 " + t("Next") : `${i + 1}. ${t("InQueue")}`}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{t("Dr")} {apt.doctorName}</p>
                    <p className="text-slate-600 text-xs">~{apt.estimatedWaitMinutes} {t("MinutesWait")}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-600 text-center">{t("NoWaiting")}</p>
              </div>
            )}
          </div>
        </div>

      
        <div className="col-span-1 p-8 flex flex-col">
        
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-3xl font-black text-white">{queue?.totalToday || 0}</p>
              <p className="text-slate-400 text-xs mt-1">{t("Today")}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-3xl font-black text-emerald-400">{queue?.completed?.length || 0}</p>
              <p className="text-slate-400 text-xs mt-1">{t("Completed")}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-3xl font-black text-amber-400">{queue?.waiting?.length || 0}</p>
              <p className="text-slate-400 text-xs mt-1">{t("Waiting")}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-3xl font-black text-sky-400">{queue?.averageDurationMinutes || 0}</p>
              <p className="text-slate-400 text-xs mt-1">{t("AvgMinutes")}</p>
            </div>
          </div>

         
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3">✓ {t("Completed")}</p>
          <div className="flex-1 overflow-y-auto space-y-2">
            {queue?.completed?.length > 0 ? [...queue.completed].reverse().map((apt) => (
              <div key={apt.id} className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">{apt.queueNumber}</span>
                </div>
                <div>
                  <p className="text-emerald-400 text-xs font-semibold">✓ {t("Completed")}</p>
                  <p className="text-slate-500 text-xs">{t("Dr")} {apt.doctorName}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-600 text-sm">{t("NoCompleted")}</p>
            )}
          </div>

          
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
            <p className="text-emerald-400 text-xs text-center animate-pulse">
              🏥 {t("QueueInfo")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;