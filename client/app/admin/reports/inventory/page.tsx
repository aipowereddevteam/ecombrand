'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, Archive, RefreshCw, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventorySummary {
    totalProducts: number;
    totalStockUnits: number;
    totalStockValue: number;
    lowStockCount: number;
    deadStockCount: number;
    deadStockValue: number;
}

interface StockItem {
    _id: string;
    name: string;
    stock: number; // For dead stock logic
    totalStock?: number; // For low stock logic
    value?: number;
    category?: string;
    image?: string;
}

interface CategoryStock {
    _id: string;
    count: number;
    value: number;
}

export default function InventoryReport() {
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [deadStock, setDeadStock] = useState<StockItem[]>([]);
    const [lowStock, setLowStock] = useState<StockItem[]>([]);
    const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api/v1';

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/inventory`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSummary(data.summary);
            setDeadStock(data.deadStock);
            setLowStock(data.lowStock);
            setCategoryStock(data.categoryStock);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

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

    if (!summary) return <div className="p-8">No data available</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Inventory Health Report</h1>
            <p className="text-gray-600 mb-8">Stock optimization and Dead Stock analysis</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Total Stock Value</p>
                            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalStockValue)}</h3>
                        </div>
                        <Layers className="text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500">{summary.totalStockUnits} units across {summary.totalProducts} products</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Low Stock Items</p>
                            <h3 className="text-2xl font-bold text-orange-600">{summary.lowStockCount}</h3>
                        </div>
                        <AlertTriangle className="text-orange-500" />
                    </div>
                    <p className="text-xs text-gray-500">Products below reorder level (20 units)</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Dead Stock Value</p>
                            <h3 className="text-2xl font-bold text-red-600">{formatCurrency(summary.deadStockValue)}</h3>
                        </div>
                        <Archive className="text-red-500" />
                    </div>
                    <p className="text-xs text-gray-500">{summary.deadStockCount} products unsold &gt; 60 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-gray-500 text-sm">Active SKU Ratio</p>
                            <h3 className="text-2xl font-bold text-green-600">
                                {(((summary.totalProducts - summary.deadStockCount) / summary.totalProducts) * 100).toFixed(1)}%
                            </h3>
                        </div>
                        <RefreshCw className="text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500">Healthy stock turnover</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Low Stock Alerts */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="mr-2 text-orange-500" size={20} />
                        Critical Low Stock
                    </h2>
                    <div className="overflow-y-auto max-h-[400px]">
                        {lowStock.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">✅ Healthy stock levels</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStock.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-orange-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                            {item.totalStock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dead Stock Analysis */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Archive className="mr-2 text-red-500" size={20} />
                        Dead Stock Candidates
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">No sales in 60+ days. Consider clearance.</p>
                    <div className="overflow-y-auto max-h-[400px]">
                         {deadStock.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">✅ No dead stock found</p>
                        ) : (
                            <div className="space-y-3">
                                {deadStock.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500">Value trapped: {formatCurrency(item.value || 0)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-600 block">{item.stock} qty</span>
                                            <button className="text-xs text-blue-600 hover:underline">Mark Clearance</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Stock Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Value by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryStock}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatCurrency(value), "Stock Value"]} />
                        <Bar dataKey="value" fill="#3B82F6" name="Stock Value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
