import { useTranslation } from "react-i18next";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/30">
      <p className="text-xs text-slate-400">
        {t("page")} <span className="font-semibold text-slate-600">{page}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              p === page
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                : "border border-gray-200 bg-white text-slate-500 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;