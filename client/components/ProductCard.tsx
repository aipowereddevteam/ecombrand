'use client';
import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import { RootState, AppDispatch } from '@/redux/store';

interface Product {
    _id: string;
    title: string;
    price: number;
    images: { url: string }[];
    category: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useDispatch<AppDispatch>();
    const wishlist = useSelector((state: RootState) => state.wishlist.items);
    const isWishlisted = wishlist.includes(product._id);

    return (
        <Link href={`/product/${product._id}`} className="group block min-w-[280px] h-[400px] flex flex-col">
            <div className="relative overflow-hidden mb-3 bg-gray-50 h-[320px] w-full">
                <img
                    src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                />

                {/* Overlay Icons on Hover */}
                <div className="absolute right-4 top-4 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch(toggleWishlist(product._id));
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-900"} />
                    </button>
                    {/* Quick View Placeholder - could open a modal */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            // Quick view logic here if needed
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <Search size={18} className="text-gray-900" />
                    </button>
                </div>
            </div>

            <div className="space-y-1 flex-1 flex flex-col justify-start">
                <h3 className="font-serif text-lg text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
                    {product.title}
                </h3>
                <div className="flex items-center gap-2 mt-auto">
                    <span className="text-gray-900 font-bold">₹{product.price}</span>
                    <span className="text-gray-400 text-xs line-through">₹{Math.round(product.price * 1.2)}</span>
                </div>
            </div>
        </Link>
    );
}
