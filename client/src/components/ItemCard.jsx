import { useState } from "react";
import {
    Calendar,
    Repeat,
    Bell,
    Check,
    Edit3,
    History,
    Trash2,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { getStatus, getDaysRemaining, getStatusConfig, formatDisplayDate } from "../utils/statusUtils";

function ItemCard({
    item,
    onComplete,
    onEdit,
    onHistory,
    onDelete,
    reminderDays = [],
    onToggleReminderDay,
    onSaveReminders,
    savingReminders = false
}) {
    const [showReminders, setShowReminders] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const status = getStatus(item.next_due_date);
    const daysRemaining = getDaysRemaining(item.next_due_date);
    const statusConfig = getStatusConfig(status);

    const reminderOptions = [30, 14, 7, 1];

    const handleDelete = () => {
        if (confirmDelete) {
            onDelete(item.id);
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 4000);
        }
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative border-l-4 ${statusConfig.cardAccent}`}>
            {/* Main Content */}
            <div className="p-5">
                {/* Header: Category Badge + Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                        {item.category_icon && <span>{item.category_icon}</span>}
                        <span>{item.category_name || "General"}</span>
                    </span>

                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotBg}`}></span>
                        <span>{status}</span>
                    </span>
                </div>

                {/* Item Name & Description */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                    {item.name}
                </h3>

                {item.description ? (
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.description}
                    </p>
                ) : (
                    <p className="mt-1 text-xs text-slate-400 italic">
                        No description provided.
                    </p>
                )}

                {/* Meta details: Due date & Recurring indicator */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                    {/* Due Date & Remaining days */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due:</span>
                            <span className="font-semibold text-slate-800">
                                {formatDisplayDate(item.next_due_date)}
                            </span>
                        </div>

                        <span className={`font-semibold ${
                            daysRemaining < 0
                                ? "text-rose-600"
                                : daysRemaining === 0
                                ? "text-red-600"
                                : daysRemaining <= 7
                                ? "text-orange-600"
                                : "text-slate-600"
                        }`}>
                            {daysRemaining < 0
                                ? `${Math.abs(daysRemaining)}d overdue`
                                : daysRemaining === 0
                                ? "Due today"
                                : `${daysRemaining}d left`}
                        </span>
                    </div>

                    {/* Purchase Date (if present) */}
                    {item.purchase_date && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Purchased: {formatDisplayDate(item.purchase_date)}</span>
                        </div>
                    )}

                    {/* Recurring Tag */}
                    {item.is_recurring && (
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Repeat className="w-3 h-3" />
                            <span>
                                Recurs every {item.recurrence_interval} {item.recurrence_unit?.toLowerCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Reminders Toggle Section */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowReminders(!showReminders)}
                        className="w-full flex items-center justify-between text-xs font-medium text-slate-600 hover:text-indigo-600 py-1 transition-colors"
                    >
                        <span className="inline-flex items-center space-x-1.5">
                            <Bell className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Reminder settings</span>
                            {reminderDays.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                                    {reminderDays.length}
                                </span>
                            )}
                        </span>
                        {showReminders ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                    </button>

                    {showReminders && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                            <p className="text-[11px] font-medium text-slate-600">
                                Remind before due date:
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {reminderOptions.map((days) => {
                                    const isChecked = reminderDays.includes(days);
                                    return (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => onToggleReminderDay(item.id, days)}
                                            className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border text-center transition-all cursor-pointer ${
                                                isChecked
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            {days} day{days !== 1 ? "s" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => onSaveReminders(item.id)}
                                disabled={savingReminders}
                                className="w-full py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {savingReminders ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5">
                {/* Complete Button */}
                <button
                    type="button"
                    onClick={() => onComplete(item.id)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors active:scale-[0.98] cursor-pointer"
                    title="Mark item completed"
                >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Complete</span>
                </button>

                {/* History Button */}
                <button
                    type="button"
                    onClick={() => onHistory(item)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="View Occurrence History"
                >
                    <History className="w-4 h-4" />
                </button>

                {/* Edit Button */}
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="Edit Item"
                >
                    <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={handleDelete}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        confirmDelete
                            ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                            : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100"
                    }`}
                    title={confirmDelete ? "Click again to confirm delete" : "Delete Item"}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default ItemCard;
