const Input = ({ label, type = "text", value, onChange, placeholder, disabled, required, error, min, max }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition-all duration-150 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? "border-rose-300 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
          : "border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 focus:bg-white"
        }`}
    />
    {error && <p className="text-xs text-rose-500 flex items-center gap-1">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      {error}
    </p>}
  </div>
);

export default Input;