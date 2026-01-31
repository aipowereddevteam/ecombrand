'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AdminRoute from '@/components/AdminRoute';
import { usePermission } from '@/hooks/usePermission';
import { Package, Truck, Clock, CheckCircle, Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IOrder {
    _id: string;
    createdAt: string;
    totalPrice: number;
    orderStatus: string;
    user?: {
        name: string;
        email: string;
    };
    orderItems: {
        _id: string;
        name: string;
        price: number;
        image: string;
        quantity: number;
        size: string;
        product: string;
    }[];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const router = useRouter();

    const [userRole, setUserRole] = useState('');

    // Scoped Permissions
    const { hasPermission: canViewAll } = usePermission('orders.tab.all');
    const { hasPermission: canViewConfirmed } = usePermission('orders.tab.confirmed');
    const { hasPermission: canPack } = usePermission('orders.action.pack');
    const { hasPermission: canPrint } = usePermission('orders.action.print');

    useEffect(() => {
        // Force Filter if restricted
        if (!canViewAll && canViewConfirmed) {
            setFilterStatus('Confirmed');
        }
    }, [canViewAll, canViewConfirmed]);

    useEffect(() => {
        // Decode token to get role (simplistic approach)
        // Decode token to get role (simplistic approach)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
                // Strict Packing Logic based on Role
                if (payload.role === 'warehouse') {
                    setFilterStatus('Confirmed');
                }
            } catch (e) {
                console.error("Token decode error", e);
            }
        }

        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';

            try {
                const { data } = await axios.get(`${apiUrl}/orders/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data.orders);
            } catch (err) {
                console.error(err);
                // Handle error (e.g., redirect if not admin, though middleware handles backend)
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'Confirmed': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'Packing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Shipped': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
            case 'Delivered': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return (
        <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <AdminRoute>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
                    <div className="flex gap-2">
                        {/* Stats Indicators could go here */}
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['All', 'Processing', 'Confirmed', 'Packing', 'Shipped', 'Delivered'].map((status) => {
                                // Scoped Permission Logic

                                // Default: All tabs hidden unless allowed
                                let isVisible = false;

                                if (status === 'All' && canViewAll) isVisible = true;
                                else if (status === 'Confirmed' && canViewConfirmed) isVisible = true;
                                else if (canViewAll) isVisible = true; // 'All' permission usually implies access to all statuses? 
                                // Or does 'orders.tab.all' strictly mean the 'All' tab?
                                // Let's simplify: If you have 'orders.tab.all', you see everything.
                                // If you only have 'orders.tab.confirmed', you only see Confirmed.

                                // Refined Logic:
                                if (canViewAll) isVisible = true; // Super user sees all tabs
                                else if (status === 'Confirmed' && canViewConfirmed) isVisible = true;
                                else if (status === 'Packing' && canViewConfirmed) isVisible = true; // Packers often need to see what they are working on? 
                                // Let's stick to strict compliance with the plan: 
                                // if (status === 'Confirmed') -> requires 'orders.tab.confirmed' OR 'orders.tab.all'

                                if (!isVisible) return null;

                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                        ${filterStatus === status
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                    >
                                        {status === 'Confirmed' && !canViewAll ? 'Ready to Pack' : status}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-6 text-sm font-mono text-foreground">#{order._id.slice(-6)}</td>
                                            <td className="py-4 px-6 text-sm text-foreground">
                                                <p className="font-medium">{order.user?.name || 'Guest'}</p>
                                                <p className="text-muted-foreground text-xs">{order.user?.email}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-muted-foreground">
                                                {order.orderItems.length} items
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-foreground">
                                                ₹{order.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors mr-2"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                {(canPack || canPrint) && order.orderStatus === 'Confirmed' && (
                                                    <button
                                                        onClick={() => alert(`Printing packing slip for ${order._id}`)}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                                                        title="Print Packing Slip"
                                                    >
                                                        <Package size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
}
