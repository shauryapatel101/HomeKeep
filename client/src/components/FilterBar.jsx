import { Search, Filter, Plus, X } from "lucide-react";

function FilterBar({
    search,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    statusFilter,
    onStatusChange,
    categories = [],
    onAddNewItem
}) {
    const hasActiveFilters = Boolean(search || categoryFilter || statusFilter);

    const clearFilters = () => {
        onSearchChange("");
        onCategoryChange("");
        onStatusChange("");
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search items by name..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Category Dropdown */}
            <div className="w-full sm:w-48">
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                            {category.icon ? `${category.icon} ` : ""}{category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:w-44">
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Expires Today">Expires Today</option>
                    <option value="Expired">Expired</option>
                </select>
            </div>

            {/* Clear Filters (if active) */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                    Reset
                </button>
            )}

            {/* Add New Item Button */}
            {onAddNewItem && (
                <button
                    type="button"
                    onClick={onAddNewItem}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-indigo-200 transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Item</span>
                </button>
            )}
        </div>
    );
}

export default FilterBar;
