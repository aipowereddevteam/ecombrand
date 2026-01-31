'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Check } from 'lucide-react';
// Cross-repo import removed to fix Docker build
// If importing from server fails due to 'fs' dependencies, we should duplicate the constant or move it to a shared folder.
// For now, let's hardcode the hierarchy here to avoid build issues, as frontend/backend sharing can be tricky without a monorepo workspace setup.

const CLIENT_PERMISSION_HIERARCHY = {
    orders: {
        label: "Order Management",
        scopes: [
            { key: 'orders.view', label: 'View Orders Page' },
            { key: 'orders.tab.all', label: 'Tab: View All' },
            { key: 'orders.tab.confirmed', label: 'Tab: Confirmed (Ready to Pack)' },
            { key: 'orders.action.pack', label: 'Action: Mark Packed' },
            { key: 'orders.action.print', label: 'Action: Print Invoices' }
        ]
    },
    analytics: {
        label: "Analytics",
        scopes: [
            { key: 'analytics.view', label: 'View Dashboard' },
            { key: 'analytics.financial', label: 'Financial Reports' }
        ]
    },
    users: {
        label: "User Management",
        scopes: [
            { key: 'users.view', label: 'View Users' },
            { key: 'users.manage', label: 'Manage Roles & Access' }
        ]
    }
};

interface ModuleSelectorProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

export default function ModuleSelector({ userId, userName, onClose }: ModuleSelectorProps) {
    const [assignedScopes, setAssignedScopes] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof CLIENT_PERMISSION_HIERARCHY>('orders');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserPermissions();
    }, [userId]);

    const fetchUserPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';
            const { data } = await axios.get(`${apiUrl}/admin/users/${userId}/modules`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns { available, assigned }
            // We only care about assigned lines now.
            setAssignedScopes(data.assigned || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
            setLoading(false);
        }
    };

    const handleToggle = (scopeKey: string) => {
        setAssignedScopes(prev => {
            if (prev.includes(scopeKey)) {
                return prev.filter(k => k !== scopeKey);
            } else {
                return [...prev, scopeKey];
            }
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';
            await axios.put(`${apiUrl}/admin/users/${userId}/modules`, {
                modules: assignedScopes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Permissions updated successfully');
            onClose();
            // Ideally force a refresh of the user list or something, but this is fine.
        } catch (error) {
            console.error("Failed to save", error);
            alert('Failed to save changes');
        }
    };

    if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-white">Loading...</div>;

    const currentCategory = CLIENT_PERMISSION_HIERARCHY[selectedCategory];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manage Access</h2>
                        <p className="text-sm text-gray-500">Assign specific permissions for <span className="font-semibold text-blue-600">{userName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Categories */}
                    <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {(Object.keys(CLIENT_PERMISSION_HIERARCHY) as Array<keyof typeof CLIENT_PERMISSION_HIERARCHY>).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                                        ${selectedCategory === key ? 'bg-white shadow text-blue-600 border border-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {CLIENT_PERMISSION_HIERARCHY[key].label}
                                    {/* Indicator dot if any perm in this cat is selected */}
                                    {CLIENT_PERMISSION_HIERARCHY[key].scopes.some(s => assignedScopes.includes(s.key)) && (
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions List */}
                    <div className="w-2/3 bg-white overflow-y-auto p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">{currentCategory.label} Permissions</h3>
                        <div className="space-y-3">
                            {currentCategory.scopes.map((scope) => {
                                const isChecked = assignedScopes.includes(scope.key);
                                return (
                                    <label key={scope.key} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                                        ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                                            ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {isChecked && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={() => handleToggle(scope.key)}
                                        />
                                        <div>
                                            <p className={`text-sm font-medium ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}>{scope.label}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{scope.key}</p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
