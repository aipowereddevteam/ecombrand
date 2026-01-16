'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ReturnStatus {
    _id: string;
    count: number;
    totalRefundAmount: number;
}

interface ReturnReason {
    _id: string;
    count: number;
}

export default function ReturnsReport() {
    const [statusData, setStatusData] = useState<ReturnStatus[]>([]);
    const [reasonData, setReasonData] = useState<ReturnReason[]>([]);
    const [summary, setSummary] = useState({ totalReturns: 0, totalRefunded: 0 });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/returns?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusData(data.statusBreakdown);
            setReasonData(data.reasonBreakdown);
            setSummary({ totalReturns: data.totalReturns, totalRefunded: data.totalRefunded });
        } catch (error) {
            console.error('Error fetching return analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const STATUS_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">↩️ Returns & Refunds</h1>
                    <p className="text-gray-600">Monitor return reasons and processing status</p>
                </div>
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm">Total Returns</p>
                        <h3 className="text-3xl font-bold text-gray-900">{summary.totalReturns}</h3>
                    </div>
                    <RotateCcw className="text-red-500 w-10 h-10" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm">Total Refunded Value</p>
                        <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalRefunded)}</h3>
                    </div>
                    <DollarSignIcon className="text-orange-500 w-10 h-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Request Status</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reason Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Top Return Reasons</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={reasonData}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="_id" type="category" width={120} style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Bar dataKey="count" name="Count" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DollarSignIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
