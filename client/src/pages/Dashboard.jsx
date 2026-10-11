import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Household from "../components/Household";
import Items from "./Items";
import Notifications from "../components/Notifications";

function Dashboard() {
    const navigate = useNavigate();
    const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Personalized greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="min-h-screen bg-slate-50/60 flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <span className="text-xl">🏠</span>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                    HomeKeep
                                </h1>
                            </div>
                            <p className="text-[11px] text-slate-500 hidden sm:block leading-tight mt-0.5">
                                Household Management & Reminders
                            </p>
                        </div>
                    </div>

                    {/* Right Controls: Notifications, User greeting, Logout */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <Notifications />

                        <div className="hidden sm:flex items-center space-x-2 py-1 px-3 rounded-full bg-slate-100 border border-slate-200/60">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                                Welcome, <strong className="text-slate-900">{user?.name || "User"}</strong>
                            </span>
                        </div>

                        <button
                            onClick={logout}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Welcome Hero Banner */}
                <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            {getGreeting()}{user?.name ? `, ${user.name}` : ""}
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Keep your household's important dates, documents, warranties, and reminders organized in one central place.
                        </p>
                    </div>
                </section>

                {/* Household Management Section */}
                <section>
                    <Household
                        selectedHouseholdId={selectedHouseholdId}
                        onSelectHousehold={(id) => setSelectedHouseholdId(id)}
                    />
                </section>

                {/* Items Management Section */}
                <section>
                    <Items
                        selectedHouseholdId={selectedHouseholdId}
                    />
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
                <p>HomeKeep — Household Management Application</p>
            </footer>
        </div>
    );
}

export default Dashboard;