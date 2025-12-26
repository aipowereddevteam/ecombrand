'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';

interface IOrder {
    _id: string;
    createdAt: string;
    totalPrice: number;
    orderStatus: string;
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

export default function MyOrders() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', image: '', orderId: '' });


    const openReviewModal = (productId: string, name: string, image: string, orderId: string) => {
        setSelectedProduct({ id: productId, name, image, orderId });
        setReviewModalOpen(true);
    };



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
        <div className="h-full flex items-center justify-center text-gray-400">Loading orders...</div>
    );

    if (error) return (
        <div className="h-full flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={32} className="mb-2" />
            <h2 className="text-lg font-bold">{error}</h2>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold">Retry</button>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center px-4 py-20">
            <Package size={64} className="text-gray-300 mb-6" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h1>
            <p className="text-gray-500 mb-8">Looks like you haven't bought anything yet.</p>
            <Link href="/" className="bg-pink-500 text-white px-6 py-3 rounded-sm font-bold hover:bg-pink-600 transition-colors uppercase tracking-wide">
                Start Shopping
            </Link>
        </div>
    );





    return (
        <div className="relative">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">

                        {/* Order Header */}
                        <div className="bg-gray-50/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">ORDER ID</p>
                                <Link href={`/orders/${order._id}`} className="font-mono text-blue-600 font-medium hover:underline text-sm">#{order._id.slice(-8)}</Link>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">DATE</p>
                                <p className="text-gray-900 font-medium text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">TOTAL AMOUNT</p>
                                <p className="text-blue-600 font-bold text-sm">₹{order.totalPrice.toFixed(2)}</p>
                            </div>
                            <div className="sm:text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                    ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                    {order.orderStatus === 'Delivered' ? <Package size={12} /> : order.orderStatus === 'Processing' ? <Clock size={12} /> : <Truck size={12} />}
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                {order.orderItems.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                                            <p className="text-xs text-gray-500">Size: {item.size} <span className="mx-2">•</span> Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <p className="font-bold text-gray-900 text-sm">₹{item.price}</p>

                                            {order.orderStatus === 'Delivered' && (
                                                <button
                                                    onClick={() => openReviewModal(item.product, item.name, item.image, order._id)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    Write Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Shared Review Modal */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                product={{
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    image: selectedProduct.image
                }}
                orderId={selectedProduct.orderId}
                onSuccess={() => {
                    // Maybe refresh orders if we want to update UI (hide Write Review button?)
                    // For now just close
                    setReviewModalOpen(false);
                }}
            />
        </div>
    );
}
