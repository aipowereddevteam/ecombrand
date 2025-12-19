'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminRoute from '@/components/AdminRoute';

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Men',
        stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });
    const [files, setFiles] = useState([]);

    const categories = ['Men', 'Women', 'Kids', 'Home', 'Electronics', 'Sports'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStockChange = (size, value) => {
        setFormData({
            ...formData,
            stock: { ...formData.stock, [size]: parseInt(value) || 0 }
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        // Create previews
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('stock', JSON.stringify(formData.stock));

            files.forEach(file => {
                data.append('images', file);
            });

            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            await axios.post(`${apiUrl}/products/admin/new`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Product Created Successfully!');
            router.push('/admin/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error creating product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Product Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                value={formData.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Category</label>
                                <select
                                    name="category"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Stock / Inventory</label>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.keys(formData.stock).map(size => (
                                    <div key={size}>
                                        <span className="text-xs text-gray-500 block text-center mb-1">{size}</span>
                                        <input
                                            type="number"
                                            className="w-full border p-1 rounded text-center text-gray-900"
                                            value={formData.stock[size]}
                                            onChange={(e) => handleStockChange(size, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Product Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            {/* Previews */}
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {previews.map((src, i) => (
                                    <img key={i} src={src} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Product...' : 'Create Product'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminRoute>
    );
}
