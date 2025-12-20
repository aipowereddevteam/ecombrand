'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle, AlertTriangle, ArrowLeft, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IOrderDetails {
    _id: string;
    createdAt: string;
    totalPrice: number;
    orderStatus: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    shippingInfo: {
        address: string;
        city: string;
        state: string;
        country: string;
        pinCode: number;
        phoneNo: number;
    };
    user: {
        name: string;
        email: string;
    };
    paymentInfo: {
        id: string;
        status: string;
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
    orderHistory?: {
        status: string;
        timestamp: string;
    }[];
}

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<IOrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                // Fetch Order Details
                const { data: orderData } = await axios.get(`${apiUrl}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(orderData.order);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const [courierName, setCourierName] = useState('');
    const [trackingId, setTrackingId] = useState('');

    const updateStatus = async (status: string) => {
        setUpdating(true);
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            const body: any = { status };
            if (status === 'Shipped') {
                if (!courierName || !trackingId) {
                    alert("Please enter Courier Name and Tracking ID");
                    setUpdating(false);
                    return;
                }
                body.courierName = courierName;
                body.trackingId = trackingId;
            }

            await axios.put(`${apiUrl}/orders/admin/order/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh
            const { data } = await axios.get(`${apiUrl}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(data.order);
            alert(`Order status updated to ${status}`);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    const steps = ['Processing', 'Confirmed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(order.orderStatus);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Link href="/admin/orders" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft size={20} /> Back to Orders
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-1">Order #{order._id.slice(-6)}</h1>
                                <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                                {order.orderStatus}
                            </span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-6">Order Timeline</h2>
                        <div className="relative">
                            {/* Line */}
                            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border"></div>

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step} className="relative flex items-center gap-4 mb-8 last:mb-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-colors
                                            ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}
                                        `}>
                                            {isCompleted ? <CheckCircle size={20} /> : <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>}
                                        </div>
                                        <div>
                                            <div className={isCurrent ? 'font-bold text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}>
                                                {step}
                                            </div>
                                            {isCompleted && (() => {
                                                // Find history entry for this step
                                                const entry = order.orderHistory?.find(h => h.status === step);
                                                return entry ? (
                                                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.orderItems.map(item => (
                                <div key={item._id} className="flex gap-4 items-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md bg-muted object-contain p-1" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Size: {item.size} • Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-4">Actions</h2>

                        <div className="space-y-3">
                            {order.orderStatus === 'Processing' && (
                                <button
                                    onClick={() => updateStatus('Confirmed')}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Confirm Order
                                </button>
                            )}

                            {(order.orderStatus === 'Confirmed' || order.orderStatus === 'Packing') && (
                                <button
                                    onClick={async () => {
                                        if (order.orderStatus === 'Confirmed') {
                                            await updateStatus('Packing');
                                        }
                                        window.open(`/admin/orders/packing/${order._id}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-medium"
                                >
                                    <Box size={18} />
                                    Print Packing Slip
                                </button>
                            )}

                            {order.orderStatus === 'Packing' && (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Courier Name (e.g. Bluedart)" 
                                            className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                                            value={courierName}
                                            onChange={(e) => setCourierName(e.target.value)}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Tracking ID" 
                                            className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => updateStatus('Shipped')}
                                        disabled={updating}
                                        className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
                                    >
                                        <Truck size={18} />
                                        Mark as Shipped
                                    </button>
                                </div>
                            )}

                            {order.orderStatus === 'Shipped' && (
                                <button
                                    onClick={() => updateStatus('Delivered')}
                                    disabled={updating}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                                >
                                    <CheckCircle size={18} />
                                    Mark Delivered
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-4">Customer Info</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Name</p>
                                <p className="font-medium text-foreground">{order.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground">{order.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium text-foreground">{order.shippingInfo.phoneNo}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Shipping Address</p>
                                <p className="font-medium text-foreground">
                                    {order.shippingInfo.address}, {order.shippingInfo.city}<br />
                                    {order.shippingInfo.state} - {order.shippingInfo.pinCode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
