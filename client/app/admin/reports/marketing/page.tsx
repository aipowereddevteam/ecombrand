'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Zap, Percent, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DiscountMetrics {
    totalDiscountGiven: number;
    discountedOrdersCount: number;
    discountedRatio: string;
    revenueImpact: number;
}

interface Campaign {
    name: string;
    budget: number;
    spend: number;
    orders: number;
    revenue: number;
    roi: number;
}

interface Channel {
    name: string;
    value: number;
    fill: string;
}

export default function MarketingReport() {
    const [discountMetrics, setDiscountMetrics] = useState<DiscountMetrics | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchMarketing = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/marketing?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDiscountMetrics(data.discountMetrics);
            setCampaigns(data.campaignPerformance);
            setChannels(data.acquisitionChannels);
        } catch (error) {
            console.error('Error fetching marketing analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketing();
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

    if (!discountMetrics) return <div className="p-8">No data available</div>;

    const discountPieData = [
        { name: 'Discounted', value: parseInt(discountMetrics.discountedRatio) },
        { name: 'Full Price', value: 100 - parseInt(discountMetrics.discountedRatio) },
    ];

    const DISCOUNT_COLORS = ['#EF4444', '#10B981'];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📣 Marketing Performance</h1>
                    <p className="text-gray-600">Campaign ROI, Discounts, and Acquisition Channels</p>
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

            {/* Discount Analysis Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Tag className="mr-2 text-blue-500" />
                    Discount Impact Analysis
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-red-600 text-sm font-medium mb-1">Total Discounts Given</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(discountMetrics.totalDiscountGiven)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-blue-600 text-sm font-medium mb-1">Discounted Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{discountMetrics.discountedOrdersCount}</p>
                        </div>
                        <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-600 text-sm font-medium mb-1">Revenue from Discounted Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(discountMetrics.revenueImpact)}</p>
                        </div>
                    </div>

                    <div className="h-64">
                         <h3 className="text-sm font-medium text-gray-500 text-center mb-2">Order Volume Split</h3>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={discountPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {discountPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={DISCOUNT_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Acquisition Channels */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Share2 className="mr-2 text-purple-500" />
                        Acquisition Channels
                    </h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            layout="vertical"
                            data={channels}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" name="Traffic %" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {channels.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Campaign Performance */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Zap className="mr-2 text-yellow-500" />
                        Campaign ROI
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map((camp, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{camp.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(camp.spend)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(camp.revenue)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                                {camp.roi}%
                                            </span>
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
