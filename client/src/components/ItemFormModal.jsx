import { useEffect } from "react";
import { X, Calendar, Layers, Clock, AlertCircle } from "lucide-react";

function ItemFormModal({
    isOpen,
    onClose,
    isEditing = false,
    formData,
    onChange,
    onSubmit,
    categories = [],
    isSubmitting = false
}) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {isEditing ? "Edit Household Item" : "Add New Household Item"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isEditing
                                ? "Update details, due dates, or recurrence intervals"
                                : "Track dates, warranties, documents, or maintenance"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {/* Item Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Item Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            placeholder="e.g. Car Insurance, AC Filter, Blood Pressure Meds"
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={onChange}
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.icon ? `${category.icon} ` : ""}{category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            placeholder="Policy number, store bought from, dosage, or instructions..."
                            rows="2"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Purchase Date */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Purchase Date <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={onChange}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Next Due / Expiration Date */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Next Due / Expiration <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="next_due_date"
                                value={formData.next_due_date}
                                onChange={onChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Recurring Controls */}
                    <div className="pt-2 border-t border-slate-100">
                        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="is_recurring"
                                checked={Boolean(formData.is_recurring)}
                                onChange={onChange}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <span className="text-xs font-semibold text-slate-800">
                                This is a recurring item (renews automatically)
                            </span>
                        </label>

                        {Boolean(formData.is_recurring) && (
                            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3 animate-in fade-in duration-150">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Repeat Every
                                    </label>
                                    <input
                                        type="number"
                                        name="recurrence_interval"
                                        min="1"
                                        placeholder="e.g. 1, 6, 12"
                                        value={formData.recurrence_interval}
                                        onChange={onChange}
                                        required={Boolean(formData.is_recurring)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Recurrence Unit
                                    </label>
                                    <select
                                        name="recurrence_unit"
                                        value={formData.recurrence_unit}
                                        onChange={onChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                    >
                                        <option value="DAY">Day(s)</option>
                                        <option value="WEEK">Week(s)</option>
                                        <option value="MONTH">Month(s)</option>
                                        <option value="YEAR">Year(s)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-indigo-200 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : isEditing
                                ? "Save Changes"
                                : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemFormModal;
