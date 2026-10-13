export const getStatus = (date) => {
    if (!date) return "Upcoming";
    const today = new Date();
    const dueDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const difference = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (difference < 0) {
        return "Expired";
    }
    if (difference === 0) {
        return "Expires Today";
    }
    if (difference <= 7) {
        return "Urgent";
    }
    if (difference <= 30) {
        return "Expiring Soon";
    }
    return "Upcoming";
};

export const getDaysRemaining = (date) => {
    if (!date) return 0;
    const today = new Date();
    const dueDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
};

export const getStatusConfig = (status) => {
    switch (status) {
        case "Expired":
            return {
                label: "Expired",
                badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
                dotBg: "bg-rose-500",
                cardAccent: "border-l-rose-500",
                statColor: "text-rose-600 bg-rose-50 border-rose-100",
            };
        case "Expires Today":
            return {
                label: "Expires Today",
                badgeBg: "bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400/20",
                dotBg: "bg-red-600 animate-pulse",
                cardAccent: "border-l-red-600",
                statColor: "text-red-600 bg-red-50 border-red-100",
            };
        case "Urgent":
            return {
                label: "Urgent",
                badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
                dotBg: "bg-orange-500",
                cardAccent: "border-l-orange-500",
                statColor: "text-orange-600 bg-orange-50 border-orange-100",
            };
        case "Expiring Soon":
            return {
                label: "Expiring Soon",
                badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
                dotBg: "bg-amber-500",
                cardAccent: "border-l-amber-500",
                statColor: "text-amber-600 bg-amber-50 border-amber-100",
            };
        case "Upcoming":
        default:
            return {
                label: "Upcoming",
                badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                dotBg: "bg-emerald-500",
                cardAccent: "border-l-emerald-500",
                statColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
            };
    }
};

export const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr.split("T")[0];
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    } catch {
        return dateStr;
    }
};
