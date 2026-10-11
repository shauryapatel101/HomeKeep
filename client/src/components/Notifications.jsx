import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Inbox, Clock } from "lucide-react";
import { API_BASE_URL } from "../utils/constants";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            fetchNotifications();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await fetchNotifications();
        } catch (error) {
            console.error("Error marking all as read:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`relative p-2 rounded-xl transition-all duration-150 border ${
                    open
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner"
                        : "bg-white border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
                aria-label="View notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white shadow-sm">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-50"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="py-10 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                                    <Inbox className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    We'll alert you when household items are approaching due dates.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isUnread = !notification.is_read;
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => isUnread && markAsRead(notification.id)}
                                        className={`p-3.5 transition-colors cursor-pointer text-left ${
                                            isUnread
                                                ? "bg-indigo-50/40 hover:bg-indigo-50/70"
                                                : "bg-white hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className={`text-xs leading-relaxed ${
                                                    isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-600"
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                {notification.created_at && (
                                                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {new Date(notification.created_at).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "numeric",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {isUnread && (
                                                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;