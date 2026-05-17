const variants = {
  primary:   "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-100",
  secondary: "bg-white border border-gray-200 text-slate-500 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
  danger:    "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 hover:shadow-lg hover:shadow-rose-100",
  success:   "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100",
  ghost:     "text-slate-400 hover:text-slate-600 hover:bg-gray-50",
  outline:   "border border-emerald-200 text-emerald-600 hover:bg-emerald-50",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const Button = ({ children, variant = "primary", size = "md", onClick, type = "button", className = "", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {children}
  </button>
);

export default Button;