import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuditLogs } from "../../api/auditApi";
import { useTranslation } from "react-i18next";

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
    style={{ width: size, height: size, top, left, right, bottom, zIndex: -1,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(60px)", opacity }} />
);

const ACTION_STYLE = {
  Created:       { bg: "rgba(16,185,129,0.12)",  text: "#059669", border: "rgba(16,185,129,0.25)",  icon: "✚" },
  Updated:       { bg: "rgba(56,189,248,0.12)",  text: "#0ea5e9", border: "rgba(56,189,248,0.25)",  icon: "✎" },
  Deleted:       { bg: "rgba(251,113,133,0.12)", text: "#fb7185", border: "rgba(251,113,133,0.25)", icon: "✕" },
  StatusChanged: { bg: "rgba(251,191,36,0.12)",  text: "#f59e0b", border: "rgba(251,191,36,0.25)",  icon: "⟳" },
};

const ENTITY_ICONS = {
  Appointment: "📅", Doctor: "👨‍⚕️", Patient: "🧑", Payment: "💳", Staff: "👤"
};

const formatDate = (date) => new Date(date).toLocaleString("az-AZ", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
});

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
};

const AuditPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ action: "", entityType: "", dateFrom: "", dateTo: "" });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 20 };
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.dateFrom) params.dateFrom = `${filters.dateFrom}T00:00:00+00:00`;
      if (filters.dateTo) params.dateTo = `${filters.dateTo}T23:59:59+00:00`;
      const res = await getAuditLogs(params);
      setLogs(res.data.data.items);
      setTotalPages(res.data.data.totalPages);
      setTotalCount(res.data.data.totalCount);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filters]);

  const handleFilterChange = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ action: "", entityType: "", dateFrom: "", dateTo: "" }); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);

  const actionLabels = {
    Created: t("Created"), Updated: t("Updated"),
    Deleted: t("Deleted"), StatusChanged: t("StatusChanged")
  };
  const entityLabels = {
    Appointment: t("Appointment"), Doctor: t("Doctor"),
    Patient: t("Patient"), Payment: t("Payment")
  };

  const ActionBadge = ({ action }) => {
    const s = ACTION_STYLE[action] || { bg: "rgba(5,150,105,0.08)", text: "rgba(6,78,59,0.6)", border: "rgba(5,150,105,0.15)", icon: "•" };
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
        style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
        {s.icon} {actionLabels[action] || action}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen pb-24 md:pb-6" style={{ background: BG }}>
      <Orb color="rgba(16,185,129,1)" size="480px" top="-80px" left="-80px" opacity={0.18} />
      <Orb color="rgba(5,150,105,1)" size="380px" bottom="-60px" right="-60px" opacity={0.13} />
      <Orb color="rgba(14,165,233,1)" size="260px" top="30%" left="50%" opacity={0.09} />

      <div className="relative z-10 p-4 md:p-6 space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-tight" style={{ color: "#064e3b" }}>
              {t("AuditLog")} <span className="text-emerald-500">·</span>
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: "rgba(6,78,59,0.55)" }}>
              {totalCount} {t("RecordsFound")}
            </p>
          </div>
          {hasFilters && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.25)" }}>
              ✕ {t("ClearFilters")}
            </motion.button>
          )}
        </motion.div>

        {/* Filtrlər */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex flex-wrap gap-3 p-4 rounded-2xl" style={glass}>

          {/* Action filtr */}
          <select value={filters.action} onChange={(e) => handleFilterChange("action", e.target.value)}
            className="rounded-xl px-4 py-2.5 text-xs font-medium outline-none flex-1 min-w-[130px]"
            style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", color: "#065f46" }}>
            <option value="">{t("AllActions")}</option>
            <option value="Created">✚ {t("Created")}</option>
            <option value="Updated">✎ {t("Updated")}</option>
            <option value="Deleted">✕ {t("Deleted")}</option>
            <option value="StatusChanged">⟳ {t("StatusChanged")}</option>
          </select>

        
          <select value={filters.entityType} onChange={(e) => handleFilterChange("entityType", e.target.value)}
            className="rounded-xl px-4 py-2.5 text-xs font-medium outline-none flex-1 min-w-[130px]"
            style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", color: "#065f46" }}>
            <option value="">{t("AllTypes")}</option>
            <option value="Appointment">📅 {t("Appointment")}</option>
            <option value="Doctor">👨‍⚕️ {t("Doctor")}</option>
            <option value="Patient">🧑 {t("Patient")}</option>
            <option value="Payment">💳 {t("Payment")}</option>
          </select>

         
          {["dateFrom", "dateTo"].map((key) => (
            <input key={key} type="date" value={filters[key]}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="rounded-xl px-4 py-2.5 text-xs outline-none flex-1 min-w-[140px]"
              style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", color: "#065f46" }} />
          ))}
        </motion.div>

        
        <div className="md:hidden space-y-3">
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 space-y-2 animate-pulse" style={glass}>
                  <div className="h-4 rounded-lg w-32" style={{ background: "rgba(5,150,105,0.1)" }} />
                  <div className="h-3 rounded-lg w-48" style={{ background: "rgba(5,150,105,0.07)" }} />
                </div>
              ))
            ) : logs.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl py-12 text-center" style={glass}>
                <p className="text-3xl mb-3">📋</p>
                <p className="text-sm font-bold" style={{ color: "rgba(6,78,59,0.5)" }}>{t("NoRecords")}</p>
              </motion.div>
            ) : logs.map((log, i) => (
              <motion.div key={log.id} custom={i} variants={rowVariants} initial="hidden" animate="visible"
                className="rounded-2xl p-4" style={glass}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <ActionBadge action={log.action} />
                  <span className="text-xs font-mono" style={{ color: "rgba(6,78,59,0.45)" }}>
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                    {log.userFullName?.[0] || "S"}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "#065f46" }}>
                    {log.userFullName === "System" ? t("System") : log.userFullName}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(6,78,59,0.45)" }}>
                    · {ENTITY_ICONS[log.entityType]} {entityLabels[log.entityType] || log.entityType}
                  </span>
                </div>
                {log.details && (
                  <p className="text-xs truncate" style={{ color: "rgba(6,78,59,0.45)" }}>{log.details}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="hidden md:block rounded-3xl overflow-hidden" style={glass}>

          {loading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4"
                  style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}>
                  <div className="w-8 h-8 rounded-xl animate-pulse shrink-0" style={{ background: "rgba(5,150,105,0.1)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-lg animate-pulse w-48" style={{ background: "rgba(5,150,105,0.1)" }} />
                    <div className="h-2.5 rounded-lg animate-pulse w-32" style={{ background: "rgba(5,150,105,0.07)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.15)" }}>📋</div>
              <p className="text-sm font-bold" style={{ color: "rgba(6,78,59,0.5)" }}>{t("NoRecords")}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(5,150,105,0.15)" }}>
                  {[t("Action"), t("Type"), t("User"), t("Details"), t("Date")].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(6,95,70,0.55)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr key={log.id} custom={i} variants={rowVariants} initial="hidden" animate="visible"
                    className="group transition-all"
                    style={{ borderBottom: "1px solid rgba(5,150,105,0.07)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(5,150,105,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    <td className="px-6 py-4"><ActionBadge action={log.action} /></td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: "rgba(6,78,59,0.65)" }}>
                        {ENTITY_ICONS[log.entityType] || "📄"}
                        {entityLabels[log.entityType] || log.entityType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                          {log.userFullName?.[0] || "S"}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: "#065f46" }}>
                          {log.userFullName === "System" ? t("System") : log.userFullName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs max-w-xs truncate" style={{ color: "rgba(6,78,59,0.5)" }}>
                        {log.details || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-mono" style={{ color: "rgba(6,78,59,0.5)" }}>
                        {formatDate(log.createdAt)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

         
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4"
              style={{ borderTop: "1.5px solid rgba(5,150,105,0.12)" }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs disabled:opacity-40"
                style={{ background: "rgba(5,150,105,0.08)", color: "#065f46", border: "1px solid rgba(5,150,105,0.15)" }}>←</motion.button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <motion.button key={p} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={page === p ? {
                    background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.35)"
                  } : {
                    background: "rgba(5,150,105,0.07)",
                    color: "rgba(6,78,59,0.65)",
                    border: "1px solid rgba(5,150,105,0.15)"
                  }}>
                  {p}
                </motion.button>
              ))}

              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs disabled:opacity-40"
                style={{ background: "rgba(5,150,105,0.08)", color: "#065f46", border: "1px solid rgba(5,150,105,0.15)" }}>→</motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuditPage;