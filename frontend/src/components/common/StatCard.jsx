const StatCard = ({ label, value, icon, color, change }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
      </div>
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        {icon && <img src={icon} alt={label} className="w-10 h-10" />}
      </div>
    </div>
  </div>
);

export default StatCard;