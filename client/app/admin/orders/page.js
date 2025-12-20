'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle, Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

    const getStatusColor = (status) => {
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
                    {['All', 'Processing', 'Confirmed', 'Packing', 'Shipped', 'Delivered'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${filterStatus === status
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                            {status}
                        </button>
                    ))}
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
                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-muted-foreground">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
