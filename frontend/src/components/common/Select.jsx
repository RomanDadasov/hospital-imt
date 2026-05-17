const Select = ({ label, value, onChange, options, placeholder }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    )}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none hover:border-gray-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 focus:bg-white text-slate-600 transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default Select;