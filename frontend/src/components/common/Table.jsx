import { useTranslation } from "react-i18next";

const Table = ({ columns, data, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-0" role="status" aria-busy="true" aria-label="Loading table data">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-32" />
              <div className="h-2.5 bg-gray-50 rounded-lg animate-pulse w-20" />
            </div>
            <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-20" />
            <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-label="No data available">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
          <img 
            src="/src/assets/icons/multiple-pages-empty-svgrepo-com.svg" 
            alt="" 
            width="24" 
            height="24"
            className="opacity-50"
            aria-hidden="true"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-400">{t("noData")}</p>
          <p className="text-xs text-slate-300 mt-0.5">{t("noRecords") || "No records to display"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={`border-b border-gray-50 hover:bg-emerald-50/30 hover:shadow-sm transition-colors duration-150 will-change-contents ${i % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3.5">
                  {col.render ? col.render(row) : (
                    <span className="text-sm text-slate-600">{row[col.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;