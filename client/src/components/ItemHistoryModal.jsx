import { useEffect } from "react";
import { X, History, CheckCircle2, Clock, User, Calendar, FileText } from "lucide-react";
import { formatDisplayDate } from "../utils/statusUtils";

function ItemHistoryModal({
    isOpen,
    onClose,
    item,
    history = [],
    loading = false
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <History className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-tight">
                                Item Occurrence History
                            </h2>
                            <p className="text-xs text-slate-500">
                                {item.name}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[28rem] overflow-y-auto">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-slate-500">Loading history records...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-12 text-center">
                            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">No history records found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Completed recurring occurrences will be automatically archived here.
                            </p>
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {history.map((record) => {
                                const isCompleted = record.status === "COMPLETED";

                                return (
                                    <div key={record.id} className="relative group">
                                        {/* Status Dot */}
                                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                                            isCompleted
                                                ? "bg-emerald-500 text-white"
                                                : "bg-amber-400 text-white"
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                            ) : (
                                                <Clock className="w-3 h-3 stroke-[2.5]" />
                                            )}
                                        </div>

                                        {/* Card content */}
                                        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                                            isCompleted
                                                ? "bg-emerald-50/30 border-emerald-200/80"
                                                : "bg-amber-50/30 border-amber-200/80"
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                                    isCompleted
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}>
                                                    {record.status}
                                                </span>

                                                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span>Due: {formatDisplayDate(record.due_date)}</span>
                                                </span>
                                            </div>

                                            {isCompleted && (
                                                <div className="pt-2 border-t border-emerald-100/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                                                    {record.completed_date && (
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3 text-emerald-600" />
                                                            <span>Completed on {formatDisplayDate(record.completed_date)}</span>
                                                        </div>
                                                    )}
                                                    {record.completed_by_name && (
                                                        <div className="flex items-center space-x-1">
                                                            <User className="w-3 h-3 text-emerald-600" />
                                                            <span>By {record.completed_by_name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {record.notes && (
                                                <div className="pt-2 text-[11px] text-slate-500 flex items-start space-x-1.5">
                                                    <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="italic">{record.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ItemHistoryModal;
