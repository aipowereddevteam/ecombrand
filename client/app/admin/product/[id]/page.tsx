'use client';
import { useState, useEffect, ChangeEvent, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminRoute from '@/components/AdminRoute';

interface IFormData {
    title: string;
    description: string;
    price: string | number;
    category: string;
    stock: {
        [key: string]: number;
        S: number;
        M: number;
        L: number;
        XL: number;
        XXL: number;
    };
    isActive: boolean;
}

interface IImage {
    public_id: string;
    url: string;
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // State for Images
    const [existingImages, setExistingImages] = useState<IImage[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Modal State
    const [modalImage, setModalImage] = useState<IImage | null>(null); // { url, public_id }

    // Form State
    const [formData, setFormData] = useState<IFormData>({
        title: '',
        description: '',
        price: '',
        category: '',
        stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        isActive: true
    });

    const categories = ['Men', 'Women', 'Kids', 'Home', 'GenZ'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/products/${id}`);
                const p = data.product;

                setFormData({
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    stock: p.stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
                    isActive: p.isActive !== undefined ? p.isActive : true
                });

                if (p.images) {
                    setExistingImages(p.images);
                }
                setFetching(false);
            } catch (error) {
                console.error("Fetch error", error);
                alert('Product not found');
                router.push('/admin/dashboard');
            }
        };

        if (id) fetchProduct();
    }, [id, router]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement; // Type assertion for checkbox properties
        const { name, value, type } = target;
        const checked = target.checked;

        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
            setNewFiles([...newFiles, ...selectedFiles]);

            const previews = selectedFiles.map(file => URL.createObjectURL(file));
            setNewPreviews([...newPreviews, ...previews]);
        }
    };

    const handleImageClick = (img: IImage) => {
        setModalImage(img);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const handleDeleteFromModal = () => {
        if (modalImage && modalImage.public_id) {
            // It's an existing image
            if (confirm('Are you sure you want to remove this image? (It will be deleted on Save)')) {
                setImagesToDelete([...imagesToDelete, modalImage.public_id]);
                setExistingImages(existingImages.filter(img => img.public_id !== modalImage.public_id));
                closeModal();
            }
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price.toString());
            data.append('category', formData.category);
            data.append('stock', JSON.stringify(formData.stock));
            data.append('isActive', formData.isActive.toString());

            // Send IDs of images to delete
            if (imagesToDelete.length > 0) {
                data.append('deleteImagePublicIds', JSON.stringify(imagesToDelete));
            }

            newFiles.forEach(file => {
                data.append('images', file);
            });

            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            await axios.put(`${apiUrl}/products/admin/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Product Updated Successfully!');
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Error updating product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <AdminRoute><div className="p-8">Loading Product...</div></AdminRoute>;

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md relative">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h1>

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

                        {/* Status Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-gray-700 font-medium">Active (Visible in Store)</label>
                        </div>

                        {/* Images Management */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Current Images (Click to View/Delete)</label>
                            <div className="flex gap-2 mb-4 overflow-x-auto">
                                {existingImages.map((img) => (
                                    <div
                                        key={img.public_id}
                                        className="relative cursor-pointer group"
                                        onClick={() => handleImageClick(img)}
                                    >
                                        <img src={img.url} alt="Product" className="h-20 w-20 object-cover rounded border hover:opacity-75" />
                                    </div>
                                ))}
                                {existingImages.length === 0 && <span className="text-sm text-gray-400">No images (or all deleted)</span>}
                            </div>

                            <label className="block text-gray-700 font-medium mb-2">Upload New Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            {/* New Previews */}
                            {newPreviews.length > 0 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto">
                                    {newPreviews.map((src, i) => (
                                        <img key={i} src={src} alt="New Preview" className="h-20 w-20 object-cover rounded border border-blue-300" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Updating Product...' : 'Update Product'}
                        </button>
                    </form>

                    {/* Image Modal */}
                    {modalImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                            <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                >
                                    &times;
                                </button>

                                <img
                                    src={modalImage.url}
                                    alt="Full Size"
                                    className="max-w-full max-h-[70vh] object-contain mx-auto mb-4"
                                />

                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-700">Image Actions</p>
                                        <p className="text-xs text-gray-500">Public ID: {modalImage.public_id}</p>
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
