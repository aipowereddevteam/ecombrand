'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, UserMinus, TrendingUp, Crown, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CustomerSummary {
    totalCustomers: number;
    newCustomers: number;
    growthRate: string;
    churnRate: string;
}

interface SegmentData {
    VIP: number;
    Loyal: number;
    Active: number;
    Occasional: number;
}

interface TopCustomer {
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    avgOrderValue: number;
}

const COLORS = ['#FFBB28', '#8884d8', '#00C49F', '#FF8042'];

export default function CustomerAnalytics() {
    const [summary, setSummary] = useState<CustomerSummary | null>(null);
    const [segments, setSegments] = useState<SegmentData | null>(null);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api/v1';

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/customers?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSummary(data.summary);
            setSegments(data.segments);
            setTopCustomers(data.topCustomers);
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const getSegmentChartData = () => {
        if (!segments) return [];
        return [
            { name: 'VIP (> ₹50k)', value: segments.VIP },
            { name: 'Loyal (> 5 Orders)', value: segments.Loyal },
            { name: 'Active (30 Days)', value: segments.Active },
            { name: 'Occasional', value: segments.Occasional },
        ];
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!summary) return <div className="p-8">No data available</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Customer Analytics</h1>
                    <p className="text-gray-600">Acquisition, Retention, and Lifetime Value</p>
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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-900">{summary.totalCustomers}</h3>
                        </div>
                        <Users className="text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">New This Period</p>
                            <h3 className="text-2xl font-bold text-gray-900">{summary.newCustomers}</h3>
                        </div>
                        <UserPlus className="text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 font-semibold flex items-center">
                        <TrendingUp size={12} className="mr-1" />
                        +{summary.growthRate}% Growth
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Churn Rate (90d)</p>
                            <h3 className="text-2xl font-bold text-red-600">{summary.churnRate}%</h3>
                        </div>
                        <UserMinus className="text-red-500" />
                    </div>
                    <p className="text-xs text-gray-500">Inactive &gt; 90 days</p>
                </div>

                 <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Avg Order Frequency</p>
                            <h3 className="text-2xl font-bold text-purple-600">3.2</h3>
                        </div>
                        <Award className="text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Orders per customer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Segmentation Chart */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Segmentation</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getSegmentChartData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getSegmentChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top High Value Customers */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Crown className="mr-2 text-yellow-500" size={20} />
                        Top 5 High Value Customers (LTV)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topCustomers.map((customer, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatCurrency(customer.totalSpent)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {customer.orderCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
