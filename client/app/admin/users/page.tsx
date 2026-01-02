
'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ModuleSelector from '@/components/admin/UserManagement/ModuleSelector';

interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [managingPermissionsFor, setManagingPermissionsFor] = useState<IUser | null>(null);
    const router = useRouter();

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?keyword=${keyword}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Enforce Super Admin only
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role !== 'admin') {
                    router.push('/admin/dashboard');
                    return;
                }
            } catch (e) {
                console.error("Token error", e);
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic update
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
            alert('Role updated successfully');
        } catch (error) {
            console.error("Error updating role", error);
            alert('Failed to update role');
        }
    };

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">All Users</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by email..."
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                                    ) : users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                                                            user.role === 'accountant' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 items-center">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="warehouse">Warehouse</option>
                                                    <option value="accountant">Accountant</option>
                                                </select>

                                                <button
                                                    onClick={() => setManagingPermissionsFor(user)}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold border border-blue-200 transition-colors"
                                                >
                                                    Manage Access
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permission Modal */}
            {
                managingPermissionsFor && (
                    <ModuleSelector
                        userId={managingPermissionsFor._id}
                        userName={managingPermissionsFor.name || managingPermissionsFor.email}
                        onClose={() => setManagingPermissionsFor(null)}
                    />
                )
            }
        </AdminRoute >
    );
}
