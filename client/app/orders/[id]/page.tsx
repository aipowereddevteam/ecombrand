'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Package, Truck, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

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

export default function UserOrderDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<IOrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const { data } = await axios.get(`${apiUrl}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(data.order);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    const steps = ['Processing', 'Confirmed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(order.orderStatus);

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/orders" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} /> Back to My Orders
                </Link>

                {/* Header Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Order #{order._id.slice(-6)}</h1>
                            <p className="text-muted-foreground text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-2xl font-bold text-primary">₹{order.totalPrice.toFixed(2)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}`}>
                                {order.orderStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Timeline Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Truck size={20} /> Track Shipment
                            </h2>
                            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Truck size={20} /> Track Shipment
                            </h2>
                            
                            {/* Horizontal Stepper */}
                            <div className="w-full py-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
                                    {/* Progress Line Background */}
                                    <div className="hidden md:block absolute top-[15px] left-0 w-full h-1 bg-muted -z-0"></div>
                                    
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        const entry = order.orderHistory?.find(h => h.status === step);

                                        return (
                                            <div key={step} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 relative z-10 w-full md:w-auto mb-6 md:mb-0 last:mb-0 group">
                                                
                                                {/* Step Circle */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform group-hover:scale-110 shrink-0
                                                    ${isCompleted 
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30' 
                                                        : 'bg-background border-muted text-muted-foreground'}
                                                `}>
                                                    {isCompleted ? <CheckCircle size={14} /> : <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30"></div>}
                                                </div>

                                                {/* Step Label & Date */}
                                                <div className="flex flex-col md:items-center text-left md:text-center">
                                                    <p className={`font-medium text-sm transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {step}
                                                    </p>
                                                    
                                                    {entry ? (
                                                        <div className="text-xs text-muted-foreground mt-0.5 md:mt-1 bg-muted/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                            {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            <span className="hidden md:inline"> • </span>
                                                            <span className="md:hidden"> </span>
                                                            {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    ) : (
                                                        <div className="h-5"></div> // Spacer
                                                    )}
                                                </div>

                                                {/* Vertical Connector for Mobile */}
                                                {index !== steps.length - 1 && (
                                                    <div className={`md:hidden absolute left-[15px] top-[32px] bottom-[-24px] w-0.5 
                                                        ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`}>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Package size={20} /> Items
                            </h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item) => (
                                    <div key={item._id} className="flex gap-4 items-center p-3 rounded-lg hover:bg-muted/20 transition-colors">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-white rounded-md border border-border p-1" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{item.name}</p>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="bg-muted px-2 py-0.5 rounded text-xs">Size: {item.size}</span>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Shipping To</h3>
                            <address className="not-italic text-sm text-foreground space-y-1">
                                <p className="font-bold">{order.user?.name}</p>
                                <p>{order.shippingInfo.address}</p>
                                <p>{order.shippingInfo.city}, {order.shippingInfo.state}</p>
                                <p>{order.shippingInfo.country} - {order.shippingInfo.pinCode}</p>
                                <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Phone</span>
                                    {order.shippingInfo.phoneNo}
                                </p>
                            </address>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Payment Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{order.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>₹{order.shippingPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>₹{order.taxPrice.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 text-xs text-center text-muted-foreground">
                                    Paid via {order.paymentInfo.id ? 'Online' : 'Cash'} <br />
                                    ID: {order.paymentInfo.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
