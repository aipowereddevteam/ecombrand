'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, PieChart as PieIcon, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PnL {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    taxCollected: number;
}

interface PaymentMethod {
    _id: string; // 'Razorpay' or 'COD'
    count: number;
    volume: number;
}

export default function FinancialReport() {
    const [pnl, setPnl] = useState<PnL | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchFinancials = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/financial?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPnl(data.pnl);
            setPaymentMethods(data.paymentMethods);
        } catch (error) {
            console.error('Error fetching financial report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!pnl) return <div className="p-8">No data available</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Financial Report</h1>
                    <p className="text-gray-600">Profit & Loss, Tax, and Payment Gateways</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* P&L Statement */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <IndianRupee className="mr-2 text-green-600" />
                        Profit & Loss Statement
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">Total Revenue</span>
                            <span className="font-bold text-gray-900">{formatCurrency(pnl.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center px-3 text-sm text-red-500">
                            <span>- Cost of Goods Sold (Est. 60%)</span>
                            <span>({formatCurrency(pnl.cogs)})</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                            <span className="font-bold text-blue-900">Gross Profit</span>
                            <span className="font-bold text-blue-900">{formatCurrency(pnl.grossProfit)}</span>
                        </div>
                        <div className="flex justify-between items-center px-3 text-sm text-orange-500">
                            <span>- Operating Expenses (Shipping + Marketing)</span>
                            <span>({formatCurrency(pnl.operatingExpenses)})</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded border-l-4 border-green-500 mt-4">
                            <span className="font-bold text-lg text-green-900">Net Profit</span>
                            <span className="font-bold text-lg text-green-900">{formatCurrency(pnl.netProfit)}</span>
                        </div>
                         <div className="flex justify-between items-center px-3 pt-4 border-t mt-4 text-xs text-gray-500">
                            <span>Tax Collected (GST)</span>
                            <span>{formatCurrency(pnl.taxCollected)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Gateway Analysis */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <CreditCard className="mr-2 text-purple-600" />
                        Payment Methods
                    </h2>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentMethods} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="_id" type="category" width={100} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="volume" name="Transaction Volume" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {paymentMethods.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry._id === 'Razorpay' ? '#3B82F6' : '#F59E0B'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {paymentMethods.map((pm) => (
                            <div key={pm._id} className="text-center p-3 bg-gray-50 rounded">
                                <p className="text-sm font-medium text-gray-500">{pm._id}</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(pm.volume)}</p>
                                <p className="text-xs text-gray-400">{pm.count} txns</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
