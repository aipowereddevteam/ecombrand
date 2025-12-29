
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import SalesTrendChart from './SalesTrendChart';
import TopProductsChart from './TopProductsChart';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [summary, setSummary] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token'); // Simplistic token retrieval
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const [summaryRes, trendRes, topRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/analytics/summary', config),
                    axios.get('http://localhost:5000/api/admin/analytics/sales-trend', config),
                    axios.get('http://localhost:5000/api/admin/analytics/top-products', config)
                ]);

                setSummary(summaryRes.data);
                setTrendData(trendRes.data);
                setTopProducts(topRes.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Date Picker placeholder */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
                    <p className="text-gray-500">Track your growth and performance</p>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
                    <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-900 rounded-md">Last 30 Days</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">Custom</button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${summary?.revenue?.toLocaleString() || 0}`}
                    trend={12}
                    trendLabel="vs last month"
                    icon={DollarSign}
                />
                <StatCard
                    title="Total Orders"
                    value={summary?.orders || 0}
                    trend={5.4}
                    trendLabel="vs last month"
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Avg Order Value"
                    value={`₹${Math.round(summary?.aov || 0)}`}
                    trend={-2.1}
                    trendLabel="vs last month"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.2%"
                    trend={0.8}
                    trendLabel="vs last month"
                    icon={Users}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesTrendChart data={trendData} />
                </div>
                <div>
                    <TopProductsChart data={topProducts} />
                </div>
            </div>
        </div>
    );
}
