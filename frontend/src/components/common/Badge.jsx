const variants = {
  Confirmed:    { cls: "bg-sky-50 text-sky-600 border border-sky-100",         dot: "bg-sky-400" },
  Pending:      { cls: "bg-amber-50 text-amber-600 border border-amber-100",   dot: "bg-amber-400" },
  Completed:    { cls: "bg-emerald-50 text-emerald-600 border border-emerald-100", dot: "bg-emerald-400" },
  Cancelled:    { cls: "bg-rose-50 text-rose-600 border border-rose-100",      dot: "bg-rose-400" },
  Upcoming:     { cls: "bg-violet-50 text-violet-600 border border-violet-100",dot: "bg-violet-400" },
  Admin:        { cls: "bg-slate-50 text-slate-600 border border-slate-200",   dot: "bg-slate-400" },
  Receptionist: { cls: "bg-sky-50 text-sky-600 border border-sky-100",         dot: "bg-sky-400" },
  Doctor:       { cls: "bg-teal-50 text-teal-600 border border-teal-100",      dot: "bg-teal-400" },
};

const Badge = ({ status }) => {
  const v = variants[status] || { cls: "bg-gray-50 text-gray-500 border border-gray-100", dot: "bg-gray-300" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${v.cls} transition-all hover:scale-105`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot} shrink-0`} />
      {status}
    </span>
  );
};

export default Badge;