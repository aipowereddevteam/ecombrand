'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';

interface SalesData {
    overview: Array<{
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
        totalTax: number;
        totalShipping: number;
    }>;
    dailyTrend: Array<{
        _id: string;
        revenue: number;
        orders: number;
        avgOrderValue: number;
    }>;
    paymentMethods: Array<{
        _id: string;
        count: number;
        revenue: number;
    }>;
    salesGoals?: {
        monthlyTarget: number;
        achieved: number;
        progress: string;
        remaining: number;
        daysLeft: number;
        dailyRequiredRate: number;
    };
}

interface HourlyData {
    data: number[][];
    labels: {
        days: string[];
        timeSlots: string[];
    };
}

interface GeoData {
    data: Array<{
        _id: string;
        orders: number;
        revenue: number;
    }>;
}

export default function SalesAnalytics() {
    const [salesData, setSalesData] = useState<SalesData | null>(null);
    const [hourlyData, setHourlyData] = useState<HourlyData | null>(null);
    const [geoData, setGeoData] = useState<GeoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [sales, hourly, geo] = await Promise.all([
                axios.get(`${apiUrl}/admin/reports/sales?range=${dateRange}`, { headers }),
                axios.get(`${apiUrl}/admin/reports/hourly-pattern?range=${dateRange}`, { headers }),
                axios.get(`${apiUrl}/admin/reports/geographic?range=${dateRange}`, { headers })
            ]);

            setSalesData(sales.data.data);
            setHourlyData(hourly.data);
            setGeoData(geo.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-IN').format(value);
    };

    const exportCSV = () => {
        if (!salesData) return;

        const csvContent = [
            ['Date', 'Revenue', 'Orders', 'Avg Order Value'],
            ...salesData.dailyTrend.map(item => [
                item._id,
                item.revenue,
                item.orders,
                item.avgOrderValue
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${Date.now()}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!salesData || !hourlyData || !geoData) {
        return <div className="p-8">No data available</div>;
    }

    const overview = salesData.overview[0];
    const getHeatmapColor = (value: number, max: number) => {
        const intensity = value / max;
        if (intensity > 0.75) return 'bg-blue-600';
        if (intensity > 0.5) return 'bg-blue-500';
        if (intensity > 0.25) return 'bg-blue-400';
        return 'bg-blue-200';
    };

    const maxHourlyValue = Math.max(...hourlyData.data.flat());

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Sales Analytics Report</h1>
                    <p className="text-gray-600">Comprehensive sales insights and trends</p>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                    </select>
                    <button 
                        onClick={exportCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Section 1: Sales Overview Cards */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalOrders)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <p className="text-gray-500 text-sm mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.avgOrderValue)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <p className="text-gray-500 text-sm mb-1">Total Tax Collected</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalTax)}</p>
                    </div>
                </div>
            </div>

            {/* Section 2: Sales Trend Line Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend Analysis</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={salesData.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                            formatter={(value: any, name: any) => {
                                if (name === 'revenue' || name === 'avgOrderValue') {
                                    return formatCurrency(value);
                                }
                                return formatNumber(value);
                            }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
                        <Line yAxisId="left" type="monotone" dataKey="avgOrderValue" stroke="#F59E0B" strokeWidth={2} name="AOV" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Section 3: Hourly Sales Heatmap */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hourly Sales Pattern (Heatmap)</h2>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        <div className="grid grid-cols-8 gap-2">
                            <div></div>
                            {hourlyData.labels.days.map(day => (
                                <div key={day} className="text-center font-semibold text-sm text-gray-700">{day}</div>
                            ))}
                            {hourlyData.labels.timeSlots.map((slot, slotIndex) => (
                                <React.Fragment key={slot}>
                                    <div className="text-sm font-semibold text-gray-700 flex items-center">{slot}</div>
                                    {hourlyData.data[slotIndex].map((value, dayIndex) => (
                                        <div
                                            key={`${slotIndex}-${dayIndex}`}
                                            className={`aspect-square rounded flex items-center justify-center ${getHeatmapColor(value, maxHourlyValue)} text-white text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity`}
                                            title={formatCurrency(value)}
                                        >
                                            {value > 0 ? `₹${(value / 1000).toFixed(0)}K` : '-'}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">💡 Insight: Identify peak sales hours to optimize marketing campaigns and inventory</p>
            </div>

            {/* Section 4: Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData.paymentMethods}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                        <Bar dataKey="count" fill="#10B981" name="Orders" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Section 5: Geographic Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Geographic Distribution (Top 10 States)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {geoData.data.map((state, index) => (
                                <tr key={state._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {state._id || 'Not Specified'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatNumber(state.orders)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                        {formatCurrency(state.revenue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatCurrency(state.revenue / state.orders)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 7: Sales Goals & Targets */}
            {salesData.salesGoals && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">🎯 Sales Goals & Targets (Monthly)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Progress Gauge / Bar */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-500">Progress</span>
                                <span className="text-sm font-bold text-blue-600">{salesData.salesGoals.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 mb-6 overflow-hidden">
                                <div 
                                    className="bg-blue-600 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 text-xs text-white font-bold"
                                    style={{ width: `${Math.min(Number(salesData.salesGoals.progress), 100)}%` }}
                                >
                                    {Number(salesData.salesGoals.progress) > 10 && `${salesData.salesGoals.progress}%`}
                                </div>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                                <div>
                                    <p className="text-gray-500">Achieved</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(salesData.salesGoals.achieved)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Target</p>
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(salesData.salesGoals.monthlyTarget)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Goal Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-red-600 text-sm font-medium mb-1">Revenue Remaining</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesData.salesGoals.remaining)}</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-orange-600 text-sm font-medium mb-1">Days Left</p>
                                <p className="text-2xl font-bold text-gray-900">{salesData.salesGoals.daysLeft} Days</p>
                            </div>
                            <div className="col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-blue-600 text-sm font-medium mb-1">Required Daily Sale to Hit Target</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesData.salesGoals.dailyRequiredRate)} / day</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
