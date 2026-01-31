'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchWishlist } from '@/redux/slices/wishlistSlice';
import FashionProductCard from '@/components/home/FashionProductCard';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface Product {
    _id: string;
    title: string;
    price: number;
    category: string;
    images: { public_id: string; url: string }[];
}

export default function WishlistPage() {
    const dispatch = useDispatch<AppDispatch>();
    const wishlistIds = useSelector((state: RootState) => state.wishlist.items);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWishlistProducts = async () => {
            setLoading(true);
            try {
                // If ids are empty, maybe we need to fetch user's wishlist first from redux action
                if (wishlistIds.length === 0) {
                     await dispatch(fetchWishlist());
                }

                // Now fetch details for these IDs (or the API could return full objects, but let's stick to current logic)
                // Actually, the server `getWishlist` returns populated objects. 
                // But `fetchWishlist` thunk maps them to IDs for the store state `items`.
                // So we might need to change `fetchWishlist` to separate IDs and Details or just fetch details here.
                
                // Let's call the API directly here to get full objects since Redux store only keeps IDs for quick toggling
                // reusing the same endpoint as it returns populated data.
                const token = localStorage.getItem('token');
                if (token) {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';
                    const { data } = await axios.get(`${apiUrl}/user/wishlist`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setProducts(data.wishlist);
                }
            } catch (error) {
                console.error("Error loading wishlist", error);
            } finally {
                setLoading(false);
            }
        };
        loadWishlistProducts();
    }, []); // Run once on mount

    // Update local products list if Redux state changes (item removed)
    useEffect(() => {
        if (products.length > 0) {
            setProducts(products.filter(p => wishlistIds.includes(p._id)));
        }
    }, [wishlistIds]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Wishlist...</div>;

    return (
        <div className="min-h-screen bg-white py-8 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Heart className="fill-red-500 text-red-500" />
                My Wishlist ({products.length})
            </h1>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 mb-4">Your wishlist is empty.</p>
                    <Link href="/" className="text-blue-600 font-bold hover:underline">Start Shopping</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <FashionProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
