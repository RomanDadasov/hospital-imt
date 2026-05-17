import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { useAppointmentRequests } from "../../hooks/useAppointmentRequests";

const NotificationBell = () => {
  const { notifications, clearNotification, clearAll, addNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.length;

  
  useAppointmentRequests((request) => {
    addNotification({
      type: "appointment_request",
      title: "🏥 New Appointment Request",
      message: `${request.patientName} — ${request.doctorName} (${request.bodyRegion})`,
      data: request,
      createdAt: new Date().toISOString(),
    });
  });

  const handleClick = (n) => {
    if (n.type === "appointment_request") {
      navigate("/appointment-requests");
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center hover:bg-emerald-800/60 transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-200">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 bg-emerald-950 border border-emerald-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-800/40">
              <p className="text-sm font-bold text-emerald-100">Notifications</p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <>
                    <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-lg font-semibold">
                      {unread} new
                    </span>
                    <button onClick={clearAll} className="text-xs text-emerald-500 hover:text-emerald-300 transition-colors">
                      Delete all
                    </button>
                  </>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 bg-emerald-900/60 rounded-2xl flex items-center justify-center border border-emerald-800/40">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm text-emerald-500 font-medium">No notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-emerald-900/50 hover:bg-emerald-900/30 transition-colors group ${
                      n.type === "appointment_request" ? "cursor-pointer" : ""
                    }`}>

                    
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === "appointment_request" ? "bg-teal-500/20" :
                      n.type === "AppointmentCreated"  ? "bg-emerald-500/20" : "bg-amber-500/20"
                    }`}>
                      {n.type === "appointment_request" ? (
                        <span className="text-sm">🏥</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          className={n.type === "AppointmentCreated" ? "text-emerald-400" : "text-amber-400"}>
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>

                    
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <p className="text-xs font-bold text-teal-300 mb-0.5">{n.title}</p>
                      )}
                      <p className="text-xs font-semibold text-emerald-100 leading-relaxed">{n.message}</p>
                      {n.type === "appointment_request" && (
                        <p className="text-xs text-teal-500 mt-0.5">Click → see requirements</p>
                      )}
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {new Date(n.createdAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                   
                    <button onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg bg-emerald-900 hover:bg-rose-500/20 flex items-center justify-center transition-all shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;