import { useEffect, useState } from "react";
import { getAppointmentStats } from "../../api/appointmentApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDarkMode } from "../../stores/darkMode";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS = {
  Pending: "#f59e0b", Confirmed: "#10b981", Completed: "#3b82f6", Cancelled: "#ef4444",
};

const toSafeText = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/ə/g, "e").replace(/Ə/g, "E").replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ö/g, "o").replace(/Ö/g, "O").replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ş/g, "s").replace(/Ş/g, "S").replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ç/g, "c").replace(/Ç/g, "C");
};


const LampCard = ({ label, value, color, glowColor, icon }) => {
  const { isDarkmodeActive } = useDarkMode();
  const [isOn, setIsOn] = useState(false);
  const [hasBeenOn, setHasBeenOn] = useState(false);

  const handleClick = () => {
    if (isDarkmodeActive) {
      setIsOn((prev) => {
        if (!prev) setHasBeenOn(true);
        return !prev;
      });
    }
  };

 
  useEffect(() => {
    if (!isDarkmodeActive) setIsOn(false);
  }, [isDarkmodeActive]);

  const lampOn = isDarkmodeActive && isOn;
  const lightCard = !isDarkmodeActive;

  return (
    <div
      onClick={handleClick}
      className="relative rounded-2xl border overflow-hidden transition-all duration-500 cursor-pointer select-none"
      style={{
        background: lampOn
          ? `radial-gradient(ellipse at 50% 0%, ${glowColor}40 0%, #1e293b 60%)`
          : isDarkmodeActive
          ? "#1e293b"
          : "white",
        borderColor: lampOn ? `${glowColor}60` : isDarkmodeActive ? "#334155" : "#f1f5f0",
        boxShadow: lampOn
          ? `0 0 40px ${glowColor}30, 0 0 80px ${glowColor}15, inset 0 0 30px ${glowColor}10`
          : "none",
        transform: lampOn ? "translateY(-2px)" : "none",
      }}
    >
      {/* Lamba işığı yuxarıdan aşağıya yayılır */}
      {lampOn && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-xl pointer-events-none"
            style={{ background: `${glowColor}60`, marginTop: -8 }}
          />
        </>
      )}


      {isDarkmodeActive && !isOn && (
        <div className="absolute inset-0 bg-slate-900/50 pointer-events-none" />
      )}

      <div className="relative z-10 p-4 md:p-5 flex items-center gap-3 md:gap-4">
   
        <div
          className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-base md:text-xl font-black shrink-0 transition-all duration-500"
          style={{
            background: lampOn
              ? `linear-gradient(135deg, ${glowColor}, ${glowColor}99)`
              : isDarkmodeActive
              ? "#334155"
              : color,
            boxShadow: lampOn ? `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40` : "none",
            color: "white",
          }}
        >
          {/* Ampul ikonu — dark modda söndü */}
          {isDarkmodeActive ? (
            <span className="text-lg transition-all duration-300" style={{ filter: lampOn ? "brightness(1.5)" : "brightness(0.4)" }}>
              💡
            </span>
          ) : (
            <span className="text-white font-black text-sm md:text-base">{value}</span>
          )}
        </div>

        <div>
          <p
            className="text-xl md:text-2xl font-black transition-all duration-500"
            style={{
              color: lampOn ? glowColor : isDarkmodeActive ? "#475569" : "#1e293b",
              textShadow: lampOn ? `0 0 20px ${glowColor}` : "none",
            }}
          >
            {value}
          </p>
          <p
            className="text-xs font-medium leading-tight transition-all duration-500"
            style={{ color: lampOn ? `${glowColor}cc` : isDarkmodeActive ? "#334155" : "#94a3b8" }}
          >
            {label}
          </p>
        </div>

        {/* Dark modda — klik hint */}
        {isDarkmodeActive && !isOn && (
          <div className="absolute right-3 top-3 opacity-30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { isDarkmodeActive } = useDarkMode();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getAppointmentStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_AZ = {
    Pending: t("Pending"), Confirmed: t("Confirmed"),
    Completed: t("Completed"), Cancelled: t("Cancelled"),
  };

  const exportExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const summaryData = [["Metric", "Value"], ["Total Appointments", stats.total], ["Confirmed", stats.confirmed], ["Completed", stats.completed], ["Cancelled", stats.cancelled]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "Overview");
      const monthlyData = [["Month", "Appointments"]];
      MONTHS_EN.forEach((m, i) => monthlyData.push([m, stats.monthly[i] || 0]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthlyData), "Monthly");
      const statusData = [["Status", "Count"]];
      stats.byStatus.forEach((s) => statusData.push([s.name, s.count]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statusData), "By Status");
      const doctorData = [["Doctor", "Appointments"]];
      stats.byDoctor.forEach((d) => doctorData.push([d.name, d.count]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(doctorData), "By Doctor");
      const deptData = [["Department", "Appointments"]];
      stats.byDept.forEach((d) => deptData.push([d.name, d.count]));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deptData), "By Department");
      XLSX.writeFile(wb, `medcare-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally { setExporting(false); }
  };

  const exportPdf = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.setTextColor(13, 148, 136);
      doc.text("MedCare Hospital - Analytics Report", 14, 20);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, 14, 28);
      doc.setFontSize(12); doc.setTextColor(30);
      doc.text("Overview", 14, 40);
      autoTable(doc, { startY: 44, head: [["Metric", "Value"]], body: [["Total Appointments", stats.total], ["Confirmed", stats.confirmed], ["Completed", stats.completed], ["Cancelled", stats.cancelled]], headStyles: { fillColor: [13, 148, 136] }, styles: { fontSize: 10 } });
      doc.text("Monthly Appointments", 14, doc.lastAutoTable.finalY + 12);
      autoTable(doc, { startY: doc.lastAutoTable.finalY + 16, head: [["Month", "Appointments"]], body: MONTHS_EN.map((m, i) => [m, stats.monthly[i] || 0]), headStyles: { fillColor: [13, 148, 136] }, styles: { fontSize: 10 } });
      if (stats.byStatus.length > 0) {
        doc.text("Appointments by Status", 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 16, head: [["Status", "Count"]], body: stats.byStatus.map((s) => [s.name, s.count]), headStyles: { fillColor: [13, 148, 136] }, styles: { fontSize: 10 } });
      }
      if (stats.byDoctor.length > 0) {
        doc.addPage(); doc.setFontSize(12); doc.setTextColor(30);
        doc.text("Appointments by Doctor", 14, 20);
        autoTable(doc, { startY: 24, head: [["Doctor", "Appointments"]], body: stats.byDoctor.map((d) => [toSafeText(d.name), d.count]), headStyles: { fillColor: [13, 148, 136] }, styles: { fontSize: 10 } });
      }
      if (stats.byDept.length > 0) {
        doc.text("Appointments by Department", 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 16, head: [["Department", "Appointments"]], body: stats.byDept.map((d) => [toSafeText(d.name), d.count]), headStyles: { fillColor: [13, 148, 136] }, styles: { fontSize: 10 } });
      }
      doc.save(`medcare-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally { setExporting(false); }
  };

  if (loading) return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const monthlyData = MONTHS.map((month, i) => ({ month, count: stats.monthly[i] || 0 }));
  const statusData = stats.byStatus.map((s) => ({ name: STATUS_AZ[s.name] || s.name, value: s.count, status: s.name }));

  const lampCards = [
    { label: t("TotalAppointments"), value: stats.total,     color: "linear-gradient(135deg,#64748b,#475569)", glowColor: "#94a3b8" },
    { label: t("Confirmed"),         value: stats.confirmed,  color: "linear-gradient(135deg,#10b981,#0d9488)", glowColor: "#10b981" },
    { label: t("Completed"),         value: stats.completed,  color: "linear-gradient(135deg,#3b82f6,#2563eb)", glowColor: "#3b82f6" },
    { label: t("Cancelled"),         value: stats.cancelled,  color: "linear-gradient(135deg,#ef4444,#dc2626)", glowColor: "#ef4444" },
  ];


  const chartBg = isDarkmodeActive ? "#1e293b" : "white";
  const chartBorder = isDarkmodeActive ? "#334155" : "#f1f5f0";
  const chartText = isDarkmodeActive ? "#94a3b8" : "#94a3b8";
  const tooltipBg = "#0f172a";
  const labelColor = isDarkmodeActive ? "#e2e8f0" : "#1e293b";
  const descColor = isDarkmodeActive ? "#475569" : "#94a3b8";

  return (
    <div className="space-y-5 pb-20 md:pb-0">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: labelColor }}>{t("Analytics")}</h1>
          <p className="text-sm mt-0.5 hidden sm:block" style={{ color: descColor }}>{t("AnalyticsDescription")}</p>
        </div>

        {/* Dark modda lamba hint */}
        {isDarkmodeActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/50">
            <span className="text-sm">💡</span>
            <span className="text-xs text-slate-500">Click on the cards, turn on the light</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={exportExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl text-xs md:text-sm font-semibold transition-all disabled:opacity-50">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Excel
          </button>
          <button onClick={exportPdf} disabled={exporting}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs md:text-sm font-semibold transition-all disabled:opacity-50">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            PDF
          </button>
        </div>
      </div>

    
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {lampCards.map((card, i) => (
          <LampCard key={i} {...card} />
        ))}
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border shadow-sm p-5 transition-all duration-500"
          style={{ background: chartBg, borderColor: chartBorder }}>
          <h2 className="font-bold mb-1 text-sm transition-colors duration-500" style={{ color: labelColor }}>{t("MonthlyAppointments")}</h2>
          <p className="text-xs mb-4 transition-colors duration-500" style={{ color: descColor }}>{t("MonthlyAppointmentsDesc")}</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkmodeActive ? "#1e293b" : "#f1f5f9"} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: chartText }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, color: "#e2e8f0", fontSize: 11 }} cursor={{ fill: isDarkmodeActive ? "#334155" : "#f1f5f9" }} />
              <Bar dataKey="count" name={t("Appointments")} fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border shadow-sm p-5 transition-all duration-500"
          style={{ background: chartBg, borderColor: chartBorder }}>
          <h2 className="font-bold mb-1 text-sm" style={{ color: labelColor }}>{t("StatusDistribution")}</h2>
          <p className="text-xs mb-4" style={{ color: descColor }}>{t("StatusDistributionDesc")}</p>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">{t("NoData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, color: "#e2e8f0", fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs" style={{ color: descColor }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border shadow-sm p-5 transition-all duration-500"
          style={{ background: chartBg, borderColor: chartBorder }}>
          <h2 className="font-bold mb-1 text-sm" style={{ color: labelColor }}>{t("DoctorLoad")}</h2>
          <p className="text-xs mb-4" style={{ color: descColor }}>{t("DoctorLoadDesc")}</p>
          {stats.byDoctor.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">{t("NoData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byDoctor.map(d => ({ name: d.name.replace("Dr. ", ""), count: d.count }))} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkmodeActive ? "#1e293b" : "#f1f5f9"} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: chartText }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: isDarkmodeActive ? "#64748b" : "#64748b" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, color: "#e2e8f0", fontSize: 11 }} />
                <Bar dataKey="count" name={t("Appointments")} fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border shadow-sm p-5 transition-all duration-500"
          style={{ background: chartBg, borderColor: chartBorder }}>
          <h2 className="font-bold mb-1 text-sm" style={{ color: labelColor }}>{t("DepartmentAppointments")}</h2>
          <p className="text-xs mb-4" style={{ color: descColor }}>{t("DepartmentAppointmentsDesc")}</p>
          {stats.byDept.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-300 text-sm">{t("NoData")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byDept.map(d => ({ name: d.name, count: d.count }))} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkmodeActive ? "#1e293b" : "#f1f5f9"} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: chartText }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: isDarkmodeActive ? "#64748b" : "#64748b" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, color: "#e2e8f0", fontSize: 11 }} />
                <Bar dataKey="count" name={t("Appointments")} fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}