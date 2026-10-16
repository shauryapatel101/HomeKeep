import { useEffect, useState } from "react";
import {
    Plus,
    AlertCircle,
    CheckCircle2,
    PackageOpen
} from "lucide-react";
import { API_BASE_URL } from "../utils/constants";
import { getStatus } from "../utils/statusUtils";
import StatsCard from "../components/StatsCard";
import FilterBar from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import ItemFormModal from "../components/ItemFormModal";
import ItemHistoryModal from "../components/ItemHistoryModal";

function Items({ selectedHouseholdId: externalHouseholdId }) {
    const [households, setHouseholds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [reminderDays, setReminderDays] = useState({});
    const [internalHouseholdId, setInternalHouseholdId] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Message / Alert
    const [message, setMessage] = useState("");
    const [isErrorMessage, setIsErrorMessage] = useState(false);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);
    const [itemHistory, setItemHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savingRemindersId, setSavingRemindersId] = useState(null);

    // Form data for creating a new item
    const [formData, setFormData] = useState({
        category_id: "",
        name: "",
        description: "",
        purchase_date: "",
        next_due_date: "",
        is_recurring: false,
        recurrence_interval: "",
        recurrence_unit: "MONTH"
    });

    const token = localStorage.getItem("token");

    // Resolve household
    const activeHouseholdId = externalHouseholdId !== undefined && externalHouseholdId !== null
        ? String(externalHouseholdId)
        : internalHouseholdId;

    const showNotification = (msg, isError = false) => {
        setMessage(msg);
        setIsErrorMessage(isError);
        setTimeout(() => {
            setMessage("");
            setIsErrorMessage(false);
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

            if (response.ok && data.households) {
                setHouseholds(data.households);
                if (data.households.length > 0 && !internalHouseholdId) {
                    setInternalHouseholdId(String(data.households[0].id));
                }
            }
        } catch (error) {
            console.error("Error fetching households:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchItems = async (householdId) => {
        if (!householdId) {
            setItems([]);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/items?household_id=${householdId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.items) {
                setItems(data.items);
                // Fetch reminders for each item
                data.items.forEach((item) => {
                    fetchItemReminders(item.id);
                });
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const fetchItemReminders = async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reminders/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.reminders) {
                const days = data.reminders.map((r) => r.days_before);
                setReminderDays((prev) => ({
                    ...prev,
                    [itemId]: days
                }));
            }
        } catch (error) {
            console.error(`Error fetching reminders for item ${itemId}:`, error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchHouseholds();
            fetchCategories();
        }
    }, [token]);

    useEffect(() => {
        if (activeHouseholdId) {
            fetchItems(activeHouseholdId);
        } else {
            setItems([]);
        }
    }, [activeHouseholdId]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();

        if (!activeHouseholdId) {
            showNotification("Please select a household first", true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    household_id: Number(activeHouseholdId),
                    ...formData,
                    category_id: Number(formData.category_id),
                    recurrence_interval: formData.is_recurring
                        ? Number(formData.recurrence_interval)
                        : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Failed to add item", true);
                return;
            }

            showNotification("Item added successfully!");

            setFormData({
                category_id: "",
                name: "",
                description: "",
                purchase_date: "",
                next_due_date: "",
                is_recurring: false,
                recurrence_interval: "",
                recurrence_unit: "MONTH"
            });

            setIsAddModalOpen(false);
            fetchItems(activeHouseholdId);
        } catch (error) {
            console.error("Error creating item:", error);
            showNotification("Unable to add item", true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeItem = async (itemId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/items/${itemId}/complete`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Unable to complete item", true);
                return;
            }

            showNotification(
                data.next_due_date
                    ? `Item completed! Next due: ${data.next_due_date.split("T")[0]}`
                    : "Item completed successfully!"
            );

            fetchItems(activeHouseholdId);
        } catch (error) {
            console.error("Error completing item:", error);
            showNotification("Unable to complete item", true);
        }
    };

    const deleteItem = async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Failed to delete item", true);
                return;
            }

            showNotification("Item deleted successfully");
            fetchItems(activeHouseholdId);
        } catch (error) {
            console.error("Error deleting item:", error);
            showNotification("Unable to delete item", true);
        }
    };

    const saveReminders = async (itemId) => {
        setSavingRemindersId(itemId);
        try {
            const response = await fetch(`${API_BASE_URL}/reminders/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    days_before: reminderDays[itemId] || []
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Unable to save reminders", true);
                return;
            }

            showNotification("Reminder settings saved");
        } catch (error) {
            console.error("Error saving reminders:", error);
            showNotification("Unable to save reminders", true);
        } finally {
            setSavingRemindersId(null);
        }
    };

    const toggleReminderDay = (itemId, days) => {
        const current = reminderDays[itemId] || [];
        const updated = current.includes(days)
            ? current.filter((d) => d !== days)
            : [...current, days];

        setReminderDays((prev) => ({
            ...prev,
            [itemId]: updated
        }));
    };

    const startEditing = (item) => {
        setEditingItem({
            id: item.id,
            name: item.name,
            description: item.description || "",
            category_id: item.category_id,
            purchase_date: item.purchase_date
                ? item.purchase_date.split("T")[0]
                : "",
            next_due_date: item.next_due_date
                ? item.next_due_date.split("T")[0]
                : "",
            is_recurring: Boolean(item.is_recurring),
            recurrence_interval: item.recurrence_interval || "",
            recurrence_unit: item.recurrence_unit || "MONTH"
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingItem((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const updateItem = async (e) => {
        e.preventDefault();

        if (!editingItem) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/items/${editingItem.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        household_id: activeHouseholdId,
                        category_id: editingItem.category_id,
                        name: editingItem.name,
                        description: editingItem.description,
                        purchase_date: editingItem.purchase_date || null,
                        next_due_date: editingItem.next_due_date,
                        is_recurring: editingItem.is_recurring,
                        recurrence_interval: editingItem.is_recurring
                            ? Number(editingItem.recurrence_interval)
                            : null,
                        recurrence_unit: editingItem.is_recurring
                            ? editingItem.recurrence_unit
                            : null
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Failed to update item", true);
                return;
            }

            showNotification("Item updated successfully");
            setEditingItem(null);
            fetchItems(activeHouseholdId);
        } catch (error) {
            console.error("Error updating item:", error);
            showNotification("Unable to update item", true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchItemHistory = async (item) => {
        try {
            setHistoryLoading(true);
            setHistoryItem(item);

            const response = await fetch(
                `${API_BASE_URL}/items/${item.id}/history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showNotification(data.message || "Unable to fetch item history", true);
                return;
            }

            setItemHistory(data.history || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            showNotification("Unable to fetch item history", true);
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistory = () => {
        setHistoryItem(null);
        setItemHistory([]);
    };

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            !categoryFilter || String(item.category_id) === categoryFilter;

        const matchesStatus =
            !statusFilter || getStatus(item.next_due_date) === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Statistics
    const stats = {
        total: items.length,
        upcoming: items.filter(
            (item) => getStatus(item.next_due_date) === "Upcoming"
        ).length,
        expiringSoon: items.filter(
            (item) => getStatus(item.next_due_date) === "Expiring Soon"
        ).length,
        urgent: items.filter(
            (item) => getStatus(item.next_due_date) === "Urgent"
        ).length,
        expired: items.filter(
            (item) => getStatus(item.next_due_date) === "Expired"
        ).length
    };

    return (
        <div className="space-y-6">
            {/* Global Notification Toast */}
            {message && (
                <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shadow-sm border transition-all ${
                        isErrorMessage
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                >
                    {isErrorMessage ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                    <span>{message}</span>
                </div>
            )}

            {/* Standalone fallback household selector if external selector not provided */}
            {externalHouseholdId === undefined && households.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-3">
                    <label className="text-xs font-semibold text-slate-700">
                        Household:
                    </label>
                    <select
                        value={internalHouseholdId}
                        onChange={(e) => setInternalHouseholdId(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    >
                        {households.map((h) => (
                            <option key={h.id} value={String(h.id)}>
                                {h.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Statistics Cards */}
            <StatsCard
                stats={stats}
                activeStatusFilter={statusFilter}
                onStatusSelect={(status) => setStatusFilter(status)}
            />

            {/* Search and Filters Bar */}
            <FilterBar
                search={search}
                onSearchChange={setSearch}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categories={categories}
                onAddNewItem={() => setIsAddModalOpen(true)}
            />

            {/* Items Grid / Empty State */}
            {items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <PackageOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                        No Items in this Household Yet
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Start keeping track of your warranties, subscriptions, documents, or maintenance dates.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Your First Item</span>
                    </button>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                        No items match your search or filter criteria.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Try resetting your search query or selecting "All Statuses" and "All Categories".
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setCategoryFilter("");
                            setStatusFilter("");
                        }}
                        className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {filteredItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onComplete={completeItem}
                            onEdit={startEditing}
                            onHistory={fetchItemHistory}
                            onDelete={deleteItem}
                            reminderDays={reminderDays[item.id] || []}
                            onToggleReminderDay={toggleReminderDay}
                            onSaveReminders={saveReminders}
                            savingReminders={savingRemindersId === item.id}
                        />
                    ))}
                </div>
            )}

            {/* Add Item Modal */}
            <ItemFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                isEditing={false}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleCreateItem}
                categories={categories}
                isSubmitting={isSubmitting}
            />

            {/* Edit Item Modal */}
            {editingItem && (
                <ItemFormModal
                    isOpen={Boolean(editingItem)}
                    onClose={() => setEditingItem(null)}
                    isEditing={true}
                    formData={editingItem}
                    onChange={handleEditChange}
                    onSubmit={updateItem}
                    categories={categories}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Item History Modal */}
            <ItemHistoryModal
                isOpen={Boolean(historyItem)}
                onClose={closeHistory}
                item={historyItem}
                history={itemHistory}
                loading={historyLoading}
            />
        </div>
    );
}

export default Items;