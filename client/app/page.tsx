'use client';
import { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryRail from '@/components/home/CategoryRail';
import FeaturedGrid from '@/components/home/FeaturedGrid';
import PromoStrip from '@/components/home/PromoStrip';
import FashionProductCard from '@/components/home/FashionProductCard';
import { useSearchParams } from 'next/navigation';

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: { public_id: string; url: string }[];
}

function HomeContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                // Note: The backend search API might need tweaking to support category filtering nicely, 
                // but for now we assume 'keyword' works or we fetch all and filter client side if needed, 
                // or the backend handles ?keyword as general search.
                // Let's assume we just fetch all or search.
                const { data } = await axios.get(`${apiUrl}/products`, {
                    params: { keyword }
                });
                
                let filtered = data.products;
                if (category) {
                     filtered = data.products.filter((p: Product) => p.category === category);
                }
                
                setProducts(filtered);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, category]);

    return (
        <div className="space-y-8 pb-20 bg-white">
            {/* 1. Hero Section */}
            {!keyword && !category && <HeroCarousel />}

            {/* 2. Category Quick Links */}
            {!keyword && !category && <CategoryRail />}
            
            {/* 3. Promo Strip */}
            {!keyword && !category && (
                <PromoStrip 
                    text="FLAT 10% OFF ON HDFC BANK CREDIT CARDS | USE CODE: HDFC10" 
                    bgColor="bg-slate-900" 
                    textColor="text-white"
                />
            )}

            {/* 4. Shop by Category Grid */}
            {!keyword && !category && <FeaturedGrid />}

            {/* 5. Trending / Product List */}
            <div className="max-w-7xl mx-auto px-4" id="products">
                <div className="flex items-center justify-between mb-8 pt-8 border-t border-gray-100">
                     <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                        {keyword ? `Search Results for "${keyword}"` : category ? `${category} Collection` : "Trending Now"}
                     </h2>
                     <span className="text-gray-500 text-sm hidden md:block">
                        {products.length} Items Found
                     </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="space-y-3">
                                <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 gap-y-12">
                        {products.map(product => (
                            <FashionProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <p className="text-xl text-gray-500">No products found.</p>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="mt-4 text-blue-600 font-medium hover:underline"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>

             {/* 6. Another Promo Strip */}
             {!keyword && !category && (
                <div className="mt-16">
                     <PromoStrip 
                        text="FREE SHIPPING ON ORDERS ABOVE ₹999 | EASY 30 DAY RETURNS" 
                        bgColor="bg-gray-100" 
                        textColor="text-gray-900"
                    />
                </div>
            )}
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store...</div>}>
            <HomeContent />
        </Suspense>
    );
}
