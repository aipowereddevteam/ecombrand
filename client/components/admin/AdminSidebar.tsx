'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    BarChart2,
    Shield,
    FileText,
    LogOut
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname?.startsWith(path) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50';

    // Permission Checks
    const hasFullOrderAccess = usePermission('Manage Orders').hasPermission;
    const hasPackingAccess = usePermission('Packing').hasPermission;
    const canViewOrders = hasFullOrderAccess || hasPackingAccess;

    const canViewUsers = usePermission('User Management').hasPermission;
    const canViewAnalytics = usePermission('Analytics').hasPermission;
    // Assuming 'Dashboard' is available to all staff or checked via role? 
    // Usually dashboard is basic access.

    return (
        <div className="w-64 bg-white border-r h-screen overflow-y-auto flex-shrink-0 flex flex-col">
            <div className="p-6 border-b flex items-center gap-2">
                <Shield className="text-blue-600" />
                <span className="font-bold text-xl tracking-tight">Staff<span className="text-blue-600">Panel</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>

                {canViewOrders && (
                    <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/orders')}`}>
                        <ShoppingCart size={20} />
                        <span>Orders</span>
                    </Link>
                )}

                {canViewUsers && (
                    <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/users')}`}>
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                )}

                {canViewAnalytics && (
                    <Link href="/admin/reports/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/reports')}`}>
                        <BarChart2 size={20} />
                        <span>Analytics</span>
                    </Link>
                )}

                {canViewUsers && (
                    <Link href="/admin/logs" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/logs')}`}>
                        <FileText size={20} />
                        <span>System Logs</span>
                    </Link>
                )}

                {/* Placeholders for other modules */}
                {/* <div className="px-4 py-2 text-xs font-semibold text-gray-400 mt-4 uppercase">Modules</div> */}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <Users size={20} />
                    <span>My Profile</span>
                </button>
            </div>
        </div>
    );
}
