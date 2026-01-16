'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, RefreshCw, Star } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
    metrics: {
        revenue: { value: number; change: string; trend: 'up' | 'down' };
        orders: { value: number; breakdown: any };
        customers: { value: number; change: string; trend: 'up' | 'down' };
        aov: { value: number };
        returns: { value: number; pending: number };
        reviews: { value: number; avgRating: string };
    };
    charts: {
        dailyTrend: Array<{ _id: string; revenue: number }>;
        categoryBreakdown: Array<{ _id: string; revenue: number; orders: number }>;
        topProducts: Array<{ _id: string; name: string; revenue: number; quantity: number }>;
    };
    alerts: {
        lowStockProducts: number;
        pendingReturns: number;
        stuckOrders: number;
    };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ExecutiveDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            
            const { data: response } = await axios.get(
                `${apiUrl}/admin/reports/dashboard?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setData(response);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) return <div className="p-8">No data available</div>;

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

    const MetricCard = ({ 
        label, 
        value, 
        change, 
        trend, 
        icon: Icon, 
        color 
    }: {
        label: string;
        value: string;
        change?: string;
        trend?: 'up' | 'down';
        icon: any;
        color: string;
    }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-50`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                        trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {change}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Executive Dashboard</h1>
                    <p className="text-gray-600">Complete business overview at a glance</p>
                </div>
                <div className="flex items-center gap-4">
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                    </select>
                    <button 
                        onClick={fetchDashboard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MetricCard
                    label="Total Revenue"
                    value={formatCurrency(data.metrics.revenue.value)}
                    change={data.metrics.revenue.change}
                    trend={data.metrics.revenue.trend}
                    icon={DollarSign}
                    color="blue"
                />
                <MetricCard
                    label="Total Orders"
                    value={formatNumber(data.metrics.orders.value)}
                    icon={ShoppingCart}
                    color="green"
                />
                <MetricCard
                    label="New Customers"
                    value={formatNumber(data.metrics.customers.value)}
                    change={data.metrics.customers.change}
                    trend={data.metrics.customers.trend}
                    icon={Users}
                    color="purple"
                />
                <MetricCard
                    label="Average Order Value"
                    value={formatCurrency(data.metrics.aov.value)}
                    icon={Package}
                    color="orange"
                />
                <MetricCard
                    label="Returns"
                    value={formatNumber(data.metrics.returns.value)}
                    icon={RefreshCw}
                    color="red"
                />
                <MetricCard
                    label="Reviews"
                    value={`${formatNumber(data.metrics.reviews.value)} (${data.metrics.reviews.avgRating}⭐)`}
                    icon={Star}
                    color="yellow"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Trend Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.charts.dailyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.charts.categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry._id}: ${((entry.revenue / data.charts.categoryBreakdown.reduce((sum, item) => sum + item.revenue, 0)) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="revenue"
                            >
                                {data.charts.categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products & Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Products</h2>
                    <div className="space-y-3">
                        {data.charts.topProducts.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-400 text-sm">#{index + 1}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">{product.name}</p>
                                        <p className="text-gray-500 text-sm">Churn Rate (90d)</p>
                                        <p className="text-sm text-gray-500">{formatNumber(product.quantity)} units sold</p>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-600">{formatCurrency(product.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Alerts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">🚨 Quick Alerts</h2>
                    <div className="space-y-3">
                        {data.alerts.lowStockProducts > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-orange-700">{data.alerts.lowStockProducts}</span> products low stock (\u003c 5 units)
                                </p>
                            </div>
                        )}
                        {data.alerts.pendingReturns > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-blue-700">{data.alerts.pendingReturns}</span> pending return requests
                                </p>
                            </div>
                        )}
                        {data.alerts.stuckOrders > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-bold text-red-700">{data.alerts.stuckOrders}</span> orders stuck in "Processing" (\u003e 48 hours)
                                </p>
                            </div>
                        )}
                        {data.alerts.lowStockProducts === 0 && data.alerts.pendingReturns === 0 && data.alerts.stuckOrders === 0 && (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <p className="text-sm">✅ No alerts - Everything looks good!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick Navigation - Added per dash.md requirements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <a href="/admin/reports/sales" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Sales Reports</span>
                </a>
                <a href="/admin/reports/products" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Product Analytics</span>
                </a>
                <a href="/admin/reports/inventory" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Inventory Health</span>
                </a>
                <a href="/admin/reports/customers" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Customer Insights</span>
                </a>
                <a href="/admin/reports/marketing" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Marketing ROI</span>
                </a>
                <a href="/admin/reports/financial" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Financial Reports</span>
                </a>
                <a href="/admin/reports/returns" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Returns & Refunds</span>
                </a>
                <a href="/admin/reports/reviews" className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-center">
                    <span className="block font-bold text-gray-800">Reviews & Ratings</span>
                </a>
            </div>
        </div>
    );
}
