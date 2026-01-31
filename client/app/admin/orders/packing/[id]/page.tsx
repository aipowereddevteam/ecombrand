'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { Package, Phone, MapPin } from 'lucide-react';

interface IOrderDetails {
    _id: string;
    createdAt: string;
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
    orderItems: {
        _id: string;
        name: string;
        quantity: number;
        size: string;
        product: string;
    }[];
}

export default function PackingSlip({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<IOrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            // In a real app, this might rely on a token, but for printing we often want it accessible 
            // or we assume the admin is already logged in and the token is in local storage.
            // For simplicity, we use the same fetch method.
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';
            try {
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

    if (loading) return <div className="p-8 text-center">Generated Packing Slip...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    return (
        <div className="min-h-screen bg-white text-black p-8 font-mono print:p-0">
            {/* Print Controls */}
            <div className="mb-8 print:hidden flex justify-between items-center max-w-3xl mx-auto">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                >
                    Print Packing Slip
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="text-gray-600 hover:text-black"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Slip Content */}
            <div className="max-w-3xl mx-auto border-2 border-black p-8 print:border-0 print:w-full">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">ShopMate</h1>
                        <p className="text-sm">Fulfillment Center #01</p>
                        <p className="text-sm">Mumbai, MH, India 400001</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold mb-1">PACKING SLIP</h2>
                        <p className="text-sm">Order ID: <span className="font-bold">{order._id}</span></p>
                        <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Shipping & Customer */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold border-b border-black mb-2 pb-1 block uppercase text-sm">Ship To</h3>
                        <p className="font-bold text-lg">{order.user?.name || 'Guest'}</p>
                        <p>{order.shippingInfo.address}</p>
                        <p>{order.shippingInfo.city}, {order.shippingInfo.state}</p>
                        <p>{order.shippingInfo.country} - {order.shippingInfo.pinCode}</p>
                        <p className="mt-2 flex items-center gap-2"><Phone size={14} /> {order.shippingInfo.phoneNo}</p>
                    </div>
                    <div>
                        <h3 className="font-bold border-b border-black mb-2 pb-1 block uppercase text-sm">Order Notes</h3>
                        <div className="h-24 border border-black border-dashed rounded p-2 text-sm text-gray-400 italic">
                            Scanner / Warehouse Notes
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-2 font-bold uppercase text-sm w-12">Chk</th>
                            <th className="text-left py-2 font-bold uppercase text-sm">Product Name</th>
                            <th className="text-center py-2 font-bold uppercase text-sm w-20">Size</th>
                            <th className="text-center py-2 font-bold uppercase text-sm w-16">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item, i) => (
                            <tr key={item._id} className="border-b border-gray-300">
                                <td className="py-3">
                                    <div className="w-6 h-6 border-2 border-black rounded-sm"></div>
                                </td>
                                <td className="py-3 font-medium">{item.name}</td>
                                <td className="py-3 text-center font-bold">{item.size}</td>
                                <td className="py-3 text-center text-lg">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="text-center border-t-2 border-black pt-6">
                    <p className="font-bold text-sm uppercase">Checked By: ___________________</p>
                    <p className="text-xs mt-2">Thank you for shopping with ShopMate!</p>
                </div>

            </div>
        </div>
    );
}
