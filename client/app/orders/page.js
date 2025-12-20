'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            try {
                const { data } = await axios.get(`${apiUrl}/orders/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data.orders);
            } catch (err) {
                setError('Failed to load orders');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-destructive">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-bold">{error}</h2>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">Retry</button>
        </div>
    );

    if (orders.length === 0) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
            <Package size={64} className="text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-2">No orders yet</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven't bought anything yet.</p>
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Start Shopping
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                            {/* Order Header */}
                            <div className="bg-muted/30 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Order ID</p>
                                    <Link href={`/orders/${order._id}`} className="font-mono text-primary font-medium hover:underline">#{order._id.slice(-8)}</Link>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
                                    <p className="text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Amount</p>
                                    <p className="text-primary font-bold text-lg">₹{order.totalPrice.toFixed(2)}</p>
                                </div>
                                <div className="sm:text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${order.orderStatus === 'Delivered' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                            order.orderStatus === 'Processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                                                'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'}`}>
                                        {order.orderStatus === 'Delivered' ? <Package size={14} /> : order.orderStatus === 'Processing' ? <Clock size={14} /> : <Truck size={14} />}
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                            </div>
                                            <div className="flex-grow">
                                                <Link href={`/product/${item.product}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">Size: {item.size} <span className="mx-2">•</span> Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-foreground">₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
