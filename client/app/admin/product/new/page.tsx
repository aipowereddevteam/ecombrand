'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminRoute from '@/components/AdminRoute';
import UploadProgressModal from '@/components/UploadProgressModal';

interface IFormData {
    title: string;
    description: string;
    price: string;
    category: string;
    stock: {
        [key: string]: number;
        S: number;
        M: number;
        L: number;
        XL: number;
        XXL: number;
    };
}

export default function AddProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Image State
    const [previews, setPreviews] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [modalImage, setModalImage] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<IFormData>({
        title: '',
        description: '',
        price: '',
        category: 'Men',
        stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });

    const categories = ['Men', 'Women', 'Kids', 'Home', 'GenZ'];

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStockChange = (size: string, value: string) => {
        setFormData({
            ...formData,
            stock: { ...formData.stock, [size]: parseInt(value) || 0 }
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles([...files, ...selectedFiles]);

            // Create previews
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    // Modal Helpers
    const handleImageClick = (src: string) => {
        setModalImage(src);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const handleDeleteFromModal = () => {
        if (modalImage) {
            const index = previews.indexOf(modalImage);
            if (index > -1) {
                if (confirm('Are you sure you want to remove this image from the upload list?')) {
                    // Create new arrays excluding the deleted item
                    const newFiles = files.filter((_, i) => i !== index);
                    const newPreviews = previews.filter((_, i) => i !== index);

                    setFiles(newFiles);
                    setPreviews(newPreviews);
                    closeModal();
                }
            }
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);

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
                    // 'Content-Type': 'multipart/form-data', // Let browser set boundary
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || 1;
                    const percent = Math.round((progressEvent.loaded * 100) / total);
                    // Only update if genuine progress is faster than simulation
                    setUploadProgress(prev => Math.max(prev, percent));
                }
            });

            // Force 100% just before success if not reached
            setUploadProgress(100);
            
            // Small delay to allow UI to render 100% before alert
            await new Promise(resolve => setTimeout(resolve, 500));
            alert('Product Created Successfully!');
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Error creating product');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // Simulated progress to give immediate feedback
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading && uploadProgress < 90) {
            interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev;
                    // Slow increment
                    return prev + 5;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [loading, uploadProgress]);

    return (
        <AdminRoute>
            {loading && <UploadProgressModal progress={uploadProgress} />}
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md relative">
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
                                rows={3}
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
                            <label className="block text-gray-700 font-medium mb-2">Product Media (Images & Videos)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const selectedFiles = Array.from(e.target.files);
                                        const validFiles: File[] = [];
                                        
                                        selectedFiles.forEach(file => {
                                            if (file.type.startsWith('video')) {
                                                if (file.size > 10 * 1024 * 1024) {
                                                    alert(`Video "${file.name}" is too large. Max size is 10MB.`);
                                                    return;
                                                }
                                            }
                                            validFiles.push(file);
                                        });

                                        if (validFiles.length > 0) {
                                            setFiles([...files, ...validFiles]);
                                            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                                            setPreviews([...previews, ...newPreviews]);
                                        }
                                    }
                                }}
                                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-sm text-gray-500 mt-1">Max video size: 10MB. Formats: MP4, WebM, etc.</p>

                            {/* Previews */}
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {previews.map((src, i) => {
                                    const file = files[i];
                                    const isVideo = file && file.type.startsWith('video');

                                    return (
                                        <div 
                                            key={i} 
                                            className="relative cursor-pointer group hover:opacity-80"
                                            onClick={() => handleImageClick(src)}
                                        >
                                            {isVideo ? (
                                                <video src={src} className="h-20 w-20 object-cover rounded border" />
                                            ) : (
                                                <img src={src} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                                            )}
                                        </div>
                                    );
                                })}
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

                    {/* Image Modal for Deletion */}
                    {modalImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                            <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                >
                                    &times;
                                </button>

                                {files.find(f => URL.createObjectURL(f) === modalImage)?.type.startsWith('video') ? (
                                    <video
                                        src={modalImage}
                                        controls
                                        className="max-w-full max-h-[70vh] object-contain mx-auto mb-4"
                                    />
                                ) : (
                                    <img
                                        src={modalImage}
                                        alt="Full Size"
                                        className="max-w-full max-h-[70vh] object-contain mx-auto mb-4"
                                    />
                                )}

                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">
                                        Click Delete to remove this image from the upload.
                                    </div>
                                    <button
                                        onClick={handleDeleteFromModal}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
                                    >
                                        Delete Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminRoute>
    );
}
