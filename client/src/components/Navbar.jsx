import { LogOut, Home, ShieldCheck } from "lucide-react";

function Navbar({ user, onLogout }) {
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                        <Home className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5">
                            <span className="text-xl font-bold tracking-tight text-slate-900">HomeKeep</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                PRO
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 hidden sm:block">Household Management & Reminders</p>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* User profile pill */}
                    <div className="flex items-center space-x-2.5 py-1 px-2.5 rounded-full bg-slate-100/80 border border-slate-200/60">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                            {initial}
                        </div>
                        <span className="text-xs font-medium text-slate-700 hidden sm:inline">
                            Welcome, <span className="font-semibold text-slate-900">{user?.name || "User"}</span>
                        </span>
                    </div>

                    {/* Logout button */}
                    <button
                        onClick={onLogout}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Sign out of HomeKeep"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
