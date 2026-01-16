'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Package, Star, AlertTriangle } from 'lucide-react';

interface ProductMetric {
    _id: string;
    name: string;
    category: string;
    revenue: number;
    orders: number;
    quantity: number;
    stock: number;
    rating: number;
    price: number;
    trend: string;
}

export default function ProductPerformance() {
    const [products, setProducts] = useState<ProductMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');
    const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'rating'>('revenue');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/products?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(data.data);
        } catch (error) {
            console.error('Error fetching product performance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const sortedProducts = [...products].sort((a, b) => b[sortBy] - a[sortBy]);

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Product Performance</h1>
                    <p className="text-gray-600">Analyze top performing products and sales trends</p>
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

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-700">Top Performing Products</h2>
                    <div className="flex gap-4 text-sm">
                        <button 
                            onClick={() => setSortBy('revenue')}
                            className={`px-3 py-1 rounded-full ${sortBy === 'revenue' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            By Revenue
                        </button>
                        <button 
                            onClick={() => setSortBy('orders')}
                            className={`px-3 py-1 rounded-full ${sortBy === 'orders' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            By Orders
                        </button>
                        <button 
                            onClick={() => setSortBy('rating')}
                            className={`px-3 py-1 rounded-full ${sortBy === 'rating' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            By Rating
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedProducts.map((product, index) => (
                                <tr key={product._id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {formatCurrency(product.revenue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {product.orders} orders
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center">
                                            <span className="mr-1">{product.rating.toFixed(1)}</span>
                                            <Star size={14} className="text-yellow-400 fill-current" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className={`flex items-center ${
                                            Number(product.trend) >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {Number(product.trend) >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                                            {Math.abs(Number(product.trend))}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
