'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, Square, Printer, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PackingSlip({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [itemsPacked, setItemsPacked] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const { data } = await axios.get(`${apiUrl}/orders/${id}`, { // Using standard fetch
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

    const toggleItem = (itemId) => {
        setItemsPacked(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const markAsPacked = async () => {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            await axios.put(`${apiUrl}/orders/admin/order/${id}`, { status: 'Packing' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push(`/admin/orders/${id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    // Auto-mark as Packed (Ready for Shipping)
    // Actually the button should probably move it to "Shipped" or just confirm "Packing" completion
    // The previous page says "Start Packing" -> Status to 'Packing'? 
    // Usually "Start Packing" changes status to 'Packing'. 
    // And this page's "Finish Packing" might change it to 'Ready to Ship' or just leave it for the Shipping integration.
    // Simplifying: "Finish Packing" -> Redirects back to details, maybe updates status or just verifies checklist.
    // Let's assume this page is FOR packing. So clicking "Complete Packing" sets status to 'Packing' (meaning it IS packed) or 'Shipped'?
    // Steps: Processing -> Confirmed -> Packing -> Shipped.
    // "Start Packing" button on Detail page (when Confirmed) goes to this page.
    // Clicking "Finish Packing" here should probably set status to 'Packing' (Done) or just keep it 'Packing' 
    // Re-reading logic in Detail Page: 
    // {order.orderStatus === 'Confirmed' && <Link... Start Packing ...>} 
    // Logic: User clicks Start Packing -> Goes here. 
    // User checks items. Clicks "Finish". System updates status to "Packing" (meaning Packing Complete/In Progress)
    // Then on Detail page, "Packing" status shows "Mark as Shipped".

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    const allPacked = order.orderItems.every(item => itemsPacked[item._id]);

    return (
        <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto">
            {/* Print Header */}
            <div className="flex justify-between items-center mb-8 no-print">
                <Link href={`/admin/orders/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-black">
                    <ArrowLeft size={20} /> Back to Order
                </Link>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                    <Printer size={18} /> Print Pick List
                </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-8 shadow-sm print:shadow-none print:border-0 print:p-0">
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">PICK LIST / PACKING SLIP</h1>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-500">Order ID</p>
                            <p className="font-mono text-xl font-bold">#{order._id.slice(-6)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-500 uppercase border-b border-gray-100 pb-2">
                        <div className="col-span-1">Check</div>
                        <div className="col-span-2">Image</div>
                        <div className="col-span-5">Product</div>
                        <div className="col-span-2 text-center">Size</div>
                        <div className="col-span-2 text-center">Qty</div>
                    </div>

                    {order.orderItems.map((item) => (
                        <div key={item._id}
                            className={`grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors
                                ${itemsPacked[item._id] ? 'opacity-50' : ''}`}
                            onClick={() => toggleItem(item._id)}
                        >
                            <div className="col-span-1 flex justify-center">
                                {itemsPacked[item._id] ? (
                                    <CheckSquare className="text-green-600" size={24} />
                                ) : (
                                    <Square className="text-gray-300" size={24} />
                                )}
                            </div>
                            <div className="col-span-2">
                                <img src={item.image} className="w-16 h-16 object-contain bg-gray-100 rounded-md" />
                            </div>
                            <div className="col-span-5">
                                <p className="font-bold text-lg">{item.name}</p>
                                <p className="text-gray-500 text-xs">SKU: {item.product.slice(-8)}</p>
                            </div>
                            <div className="col-span-2 text-center text-xl font-mono font-bold">
                                {item.size}
                            </div>
                            <div className="col-span-2 text-center text-xl font-bold">
                                {item.quantity}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 no-print">
                    <button
                        onClick={markAsPacked}
                        disabled={!allPacked && false} // Allow force finish? Maybe valid
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3
                            ${allPacked
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Package />
                        {allPacked ? 'Finish Packing & Update Status' : 'Pack All Items to Finish'}
                    </button>
                </div>
            </div>
        </div>
    );
}
