import { useTranslation } from "react-i18next";

const SearchBar = ({ value, onChange, placeholder, className = "" }) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full">
      {/* Icon */}
      <img
        src="/src/assets/icons/search-svgrepo-com.svg"
        alt="search"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t("search")}
        className={`
          w-full pl-9 pr-4 py-2
          rounded-xl text-sm outline-none transition-all
          bg-gray-50 border border-gray-200
          hover:border-gray-300
          focus:ring-2 focus:ring-emerald-200
          focus:border-emerald-400 focus:bg-white
          ${className}
        `}
      />
    </div>
  );
};

export default SearchBar;