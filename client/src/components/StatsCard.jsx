import {
    Layers,
    CalendarCheck,
    Clock,
    AlertTriangle,
    AlertOctagon
} from "lucide-react";

function StatsCard({ stats, activeStatusFilter, onStatusSelect }) {
    const statCards = [
        {
            id: "ALL",
            title: "Total Items",
            value: stats.total || 0,
            icon: Layers,
            color: "text-slate-700 bg-slate-100 border-slate-200",
            iconBg: "bg-slate-100 text-slate-700",
            activeRing: "ring-2 ring-slate-400 bg-slate-50/80",
            statusKey: ""
        },
        {
            id: "Upcoming",
            title: "Upcoming",
            value: stats.upcoming || 0,
            icon: CalendarCheck,
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
            iconBg: "bg-emerald-100 text-emerald-700",
            activeRing: "ring-2 ring-emerald-500 bg-emerald-50/50",
            statusKey: "Upcoming"
        },
        {
            id: "Expiring Soon",
            title: "Expiring Soon",
            value: stats.expiringSoon || 0,
            icon: Clock,
            color: "text-amber-700 bg-amber-50 border-amber-200",
            iconBg: "bg-amber-100 text-amber-700",
            activeRing: "ring-2 ring-amber-500 bg-amber-50/50",
            statusKey: "Expiring Soon"
        },
        {
            id: "Urgent",
            title: "Urgent",
            value: stats.urgent || 0,
            icon: AlertTriangle,
            color: "text-orange-700 bg-orange-50 border-orange-200",
            iconBg: "bg-orange-100 text-orange-700",
            activeRing: "ring-2 ring-orange-500 bg-orange-50/50",
            statusKey: "Urgent"
        },
        {
            id: "Expired",
            title: "Expired",
            value: stats.expired || 0,
            icon: AlertOctagon,
            color: "text-rose-700 bg-rose-50 border-rose-200",
            iconBg: "bg-rose-100 text-rose-700",
            activeRing: "ring-2 ring-rose-500 bg-rose-50/50",
            statusKey: "Expired"
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {statCards.map((card) => {
                const IconComponent = card.icon;
                const isSelected = activeStatusFilter === card.statusKey;

                return (
                    <button
                        key={card.id}
                        type="button"
                        onClick={() => onStatusSelect && onStatusSelect(card.statusKey)}
                        className={`text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden ${
                            isSelected ? card.activeRing : "hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 tracking-wide">
                                {card.title}
                            </span>
                            <div className={`p-2 rounded-xl transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}>
                                <IconComponent className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline space-x-1.5">
                            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {card.value}
                            </span>
                            <span className="text-xs text-slate-400">items</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default StatsCard;
