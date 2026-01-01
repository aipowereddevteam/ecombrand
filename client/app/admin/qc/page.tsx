'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

interface IReturnRequest {
    _id: string;
    order: {
        _id: string;
        orderItems: any[];
    }; // populated
    user: string;
    items: any[];
    status: string;
    refundAmount: number;
    reason: string;
    createdAt: string;
}

export default function AdminQCPanel() {
    const [requests, setRequests] = useState<IReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchRequests = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/admin/requests?status=Requested`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Also fetch QC_Pending, Pickup_Scheduled if needed. 
            // For now, let's assume 'Requested' -> 'QC_Pending' flow or just list all 'Requested' ones as pending action.
            // Wait, my controller filters by status if provided. If I want all pending QC, I might need multiple status or just filter client side.
            // Let's fetch all and filter in UI for now or just fetch 'Requested' and 'QC_Pending'.
            // Actually, let's just fetch all without status filter to see everything, then filter in UI.
            
            const allRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/admin/requests`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(allRes.data.requests);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleQCAction = async (id: string, action: 'QC_Passed' | 'QC_Failed', notes: string) => {
        const token = localStorage.getItem('token');
        if (!confirm(`Are you sure you want to mark this as ${action}?`)) return;

        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/v1/admin/qc`, {
                returnRequestId: id,
                status: action,
                notes,
                rejectionReason: action === 'QC_Failed' ? notes : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Status updated successfully');
            fetchRequests(); // Refresh
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading QC Panel...</div>;

    // Filter for "Pending Action" tabs could be added here.
    // For now, list Pending first.
    
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-outfit">Return Management (QC)</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b">
                            <tr>
                                <th className="p-4">Request ID</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4">Refund Amt</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-mono text-gray-600">#{req._id.slice(-6)}</td>
                                    <td className="p-4 font-mono text-blue-600">
                                        <a href={`/orders/${req.order?._id}`} target="_blank" rel="noreferrer">
                                            #{req.order?._id?.slice(-6) || 'UNKNOWN'}
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {req.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                     <span className="font-bold">{item.quantity}x</span>
                                                     {/* Populating product name would be nice, but simple layout for now */}
                                                     <span>Item (Cond: {item.condition})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{req.items[0]?.reason}</td>
                                    <td className="p-4 font-bold text-gray-900">₹{req.refundAmount}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${req.status === 'Requested' ? 'bg-blue-100 text-blue-700' :
                                              req.status === 'QC_Passed' ? 'bg-green-100 text-green-700' :
                                              req.status === 'Refunded' ? 'bg-emerald-100 text-emerald-800' :
                                              req.status === 'QC_Failed' ? 'bg-red-100 text-red-700' :
                                              'bg-gray-100 text-gray-600'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {['Requested', 'QC_Pending', 'Pickup_Scheduled'].includes(req.status) ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleQCAction(req._id, 'QC_Passed', 'Item verified, condition OK')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Pass QC"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const reason = prompt("Enter rejection reason:");
                                                        if (reason) handleQCAction(req._id, 'QC_Failed', reason);
                                                    }}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Fail QC"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {requests.length === 0 && (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <Package size={48} className="mb-4 opacity-20" />
                        <p>No return requests found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
