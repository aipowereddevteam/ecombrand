'use client';
import { useEffect, useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import axios from 'axios';

interface IProduct {
    _id: string;
    title: string;
    price: number;
    category: string;
    images: { public_id: string; url: string }[];
    isActive: boolean;
}

export default function AdminDashboard() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.get(`${apiUrl}/products/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(data.products);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeactivate = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this product?')) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            await axios.delete(`${apiUrl}/products/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh list
            fetchProducts();
            alert('Product deactivated successfully');
        } catch (error) {
            console.error("Delete error", error);
            alert('Failed to deactivate product');
        }
    };

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <Link
                            href="/admin/product/new"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + Add New Product
                        </Link>
                    </div>

                    {/* Stats Cards (Placeholder logic for now) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Products</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Active Products</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {products.filter(p => p.isActive).length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Inactive Products</h3>
                            <p className="text-3xl font-bold text-red-500 mt-2">
                                {products.filter(p => !p.isActive).length}
                            </p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Product Inventory</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                                    ) : products.map((product) => (
                                        <tr key={product._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0].url} alt={product.title} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Img</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link href={`/admin/product/${product._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                                {product.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivate(product._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
}
