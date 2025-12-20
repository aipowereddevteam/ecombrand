'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: { public_id: string; url: string }[];
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/products`);
                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching products", error);
            }
        };
        fetchProducts();
    }, []);

    const categories = [
        { name: 'Mobiles', icon: '📱' },
        { name: 'Fashion', icon: '👕' },
        { name: 'Electronics', icon: '💻' },
        { name: 'Home', icon: '🏠' },
        { name: 'Appliances', icon: '🧊' },
        { name: 'Travel', icon: '✈️' },
        { name: 'Toys', icon: '🧸' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 pt-6 mb-12">
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10">
                    {/* Gradient Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold mb-4 tracking-tight">Summer Collection</h1>
                            <p className="text-xl text-blue-100 mb-8">Upgrade your lifestyle with our premium selection.</p>
                            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 pl-2">Browse Categories</h2>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 cursor-pointer group min-w-[100px]">
                            <div className="w-20 h-20 rounded-full bg-white shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all flex items-center justify-center text-3xl border border-gray-100">
                                {cat.icon}
                            </div>
                            <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                    <Link href="/products" className="text-blue-600 font-semibold hover:underline">View All</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.length > 0 ? products.map(product => (
                        <div key={product._id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gray-100/50">
                            <div className="h-56 w-full mb-4 flex items-center justify-center relative bg-gray-50 rounded-xl overflow-hidden">
                                <img
                                    src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/150'}
                                    alt={product.title}
                                    className="h-full w-full object-contain mix-blend-multiply p-4 group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Discount Badge */}
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    20% OFF
                                </div>
                            </div>

                            <div className="px-2">
                                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{product.category}</p>
                                <h3 className="font-bold text-gray-900 truncate text-lg mb-2 group-hover:text-blue-600 transition-colors">{product.title}</h3>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 line-through text-xs">₹{Math.round(product.price * 1.2)}</span>
                                        <span className="font-bold text-xl text-gray-900">₹{product.price}</span>
                                    </div>
                                    <button className="bg-blue-50 text-blue-600 p-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        [1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm h-80 animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-xl mb-4 w-full"></div>
                                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
