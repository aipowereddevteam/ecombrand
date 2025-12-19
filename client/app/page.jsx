'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
    const [products, setProducts] = useState([]);

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
        { name: 'Mobiles', img: 'https://rukminim1.flixcart.com/flap/80/80/image/22fddf3c7da4c4f4.png' },
        { name: 'Fashion', img: 'https://rukminim1.flixcart.com/fk-p-flap/80/80/image/0d75b34f7d8fbcb3.png' },
        { name: 'Electronics', img: 'https://rukminim1.flixcart.com/flap/80/80/image/69c6589653afdb9a.png' },
        { name: 'Home', img: 'https://rukminim1.flixcart.com/flap/80/80/image/ab7e2b022a4587dd.jpg' },
        { name: 'Appliances', img: 'https://rukminim1.flixcart.com/flap/80/80/image/0ff199d1bd27eb98.png' },
        { name: 'Travel', img: 'https://rukminim1.flixcart.com/flap/80/80/image/71050627a56cb900.png' },
        { name: 'Toys', img: 'https://rukminim1.flixcart.com/flap/80/80/image/dff3f7adcf3a90c6.png' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-10">

            {/* Categories Row */}
            <div className="bg-white shadow-sm mb-4">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex flex-col items-center cursor-pointer min-w-[64px] group">
                            <div className="h-16 w-16 mb-1">
                                <img src={cat.img} alt={cat.name} className="h-full w-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero Banner (Static for now) */}
            <div className="max-w-7xl mx-auto px-2 mb-4">
                <div className="relative w-full h-48 md:h-72 bg-gray-300 overflow-hidden">
                    {/* Placeholder for Slider */}
                    <img
                        src="https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/1e174e2d4d9b7100.jpg"
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-2">
                <div className="bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Suggested for You</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.length > 0 ? products.map(product => (
                            <div key={product._id} className="border p-4 hover:shadow-lg transition-shadow flex flex-col group cursor-pointer">
                                <div className="h-48 w-full mb-4 flex items-center justify-center relative">
                                    <img
                                        src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/150'}
                                        alt={product.title}
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <h3 className="font-medium text-gray-800 truncate mb-1" title={product.title}>{product.title}</h3>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="font-bold text-lg">₹{product.price}</span>
                                    {/* Fake original price logic */}
                                    <span className="text-gray-500 line-through text-sm">₹{Math.round(product.price * 1.2)}</span>
                                    <span className="text-green-600 text-sm font-medium">20% off</span>
                                </div>
                                <span className="text-xs text-gray-500 mb-2">Free delivery</span>
                            </div>
                        )) : (
                            <div className="col-span-4 text-center py-10 text-gray-500">Loading products...</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
