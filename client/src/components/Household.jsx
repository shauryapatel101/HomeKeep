import { useEffect, useState } from "react";
import {
    Home,
    Users,
    UserPlus,
    PlusCircle,
    CheckCircle2,
    AlertCircle,
    Mail,
    ChevronDown,
    Building2
} from "lucide-react";
import { API_BASE_URL } from "../utils/constants";

function Household({
    selectedHouseholdId,
    onSelectHousehold,
    onHouseholdsLoaded
}) {
    const [households, setHouseholds] = useState([]);
    const [internalSelectedHousehold, setInternalSelectedHousehold] = useState(null);
    const [members, setMembers] = useState([]);

    const [householdName, setHouseholdName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isCreatingHousehold, setIsCreatingHousehold] = useState(false);

    const token = localStorage.getItem("token");

    // Selected household resolution
    const activeHousehold = selectedHouseholdId
        ? households.find((h) => String(h.id) === String(selectedHouseholdId)) || internalSelectedHousehold
        : internalSelectedHousehold;

    const showMessage = (msg, error = false) => {
        setMessage(msg);
        setIsError(error);
        setTimeout(() => {
            setMessage("");
            setIsError(false);
        }, 4000);
    };

    const fetchHouseholds = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/households`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Failed to load households", true);
                return;
            }

            setHouseholds(data.households || []);

            if (onHouseholdsLoaded) {
                onHouseholdsLoaded(data.households || []);
            }

            if (data.households && data.households.length > 0) {
                if (!selectedHouseholdId && !internalSelectedHousehold) {
                    setInternalSelectedHousehold(data.households[0]);
                    if (onSelectHousehold) {
                        onSelectHousehold(String(data.households[0].id));
                    }
                }
            }
        } catch (error) {
            console.error("Error loading households:", error);
            showMessage("Unable to load households", true);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (householdId) => {
        if (!householdId) return;
        try {
            const response = await fetch(
                `${API_BASE_URL}/households/${householdId}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Failed to load members", true);
                return;
            }

            setMembers(data.members || []);
        } catch (error) {
            console.error("Error loading members:", error);
            showMessage("Unable to load household members", true);
        }
    };

    useEffect(() => {
        if (token) {
            fetchHouseholds();
        }
    }, [token]);

    useEffect(() => {
        if (activeHousehold?.id) {
            fetchMembers(activeHousehold.id);
        }
    }, [activeHousehold?.id]);

    const handleSelectChange = (id) => {
        const found = households.find((h) => String(h.id) === String(id));
        setInternalSelectedHousehold(found || null);
        if (onSelectHousehold) {
            onSelectHousehold(String(id));
        }
    };

    const createHousehold = async (e) => {
        e.preventDefault();

        if (!householdName.trim()) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/households`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: householdName.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Unable to create household", true);
                return;
            }

            setHouseholdName("");
            setIsCreatingHousehold(false);
            showMessage("Household created successfully!");

            await fetchHouseholds();

            if (data.householdId) {
                handleSelectChange(data.householdId);
            }
        } catch (error) {
            console.error("Error creating household:", error);
            showMessage("Unable to create household", true);
        }
    };

    const addMember = async (e) => {
        e.preventDefault();

        if (!memberEmail.trim() || !activeHousehold) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/households/${activeHousehold.id}/members`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: memberEmail.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(data.message || "Unable to add member", true);
                return;
            }

            setMemberEmail("");
            showMessage("Member added to household successfully!");
            fetchMembers(activeHousehold.id);
        } catch (error) {
            console.error("Error adding member:", error);
            showMessage("Unable to add member", true);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
                <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Top Bar / Feedback Alert */}
            {message && (
                <div className={`px-4 py-2.5 text-xs font-medium flex items-center space-x-2 border-b ${
                    isError
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                    {isError ? (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{message}</span>
                </div>
            )}

            <div className="p-5 sm:p-6 space-y-6">
                {/* Header: Household Switcher & New Household Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
                                Active Household
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                                {members.length} {members.length === 1 ? "member" : "members"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                {activeHousehold?.name || "No Household Selected"}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Switcher Select */}
                        {households.length > 0 && (
                            <div className="relative min-w-44">
                                <select
                                    value={activeHousehold?.id || ""}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none"
                                >
                                    {households.map((household) => (
                                        <option key={household.id} value={household.id}>
                                            {household.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        )}

                        {/* Toggle Create Household Form */}
                        <button
                            type="button"
                            onClick={() => setIsCreatingHousehold(!isCreatingHousehold)}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        >
                            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>New Household</span>
                        </button>
                    </div>
                </div>

                {/* Create Household Expandable Box */}
                {isCreatingHousehold && (
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in fade-in duration-150">
                        <h3 className="text-xs font-bold text-indigo-950 mb-2">
                            Create a New Household
                        </h3>
                        <form onSubmit={createHousehold} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Household name (e.g. Oak Street Villa, My Apartment)"
                                value={householdName}
                                onChange={(e) => setHouseholdName(e.target.value)}
                                required
                                className="flex-1 px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingHousehold(false)}
                                    className="px-3 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Empty State when no household created */}
                {households.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h3 className="text-sm font-semibold text-slate-700">No Households Yet</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Create your first household above to start organizing items and inviting members.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Members List (Col 7) */}
                        <div className="lg:col-span-7 space-y-3">
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Household Members</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {members.map((member) => {
                                    const memberInitial = member.name
                                        ? member.name.charAt(0).toUpperCase()
                                        : "U";

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                {memberInitial}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                    {member.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    {member.email}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-600">
                                                Member
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Member Form (Col 5) */}
                        <div className="lg:col-span-5 bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2.5">
                            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Add Member by Email</span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Invite any registered HomeKeep user to collaborate with equal permissions.
                            </p>

                            <form onSubmit={addMember} className="space-y-2">
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        placeholder="registered_user@example.com"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                    Add to Household
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Household;