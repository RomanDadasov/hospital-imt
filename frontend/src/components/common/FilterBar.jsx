const FilterBar = ({ children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div className="flex items-center gap-3 flex-wrap">
      {children}
    </div>
  </div>
);

export default FilterBar;