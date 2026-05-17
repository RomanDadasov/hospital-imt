const colors = [
  "bg-sky-100 text-sky-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const Avatar = ({ name, size = "md" }) => {
  const index = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`${sizes[size]} ${colors[index]} rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

export default Avatar;