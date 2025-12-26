'use client';
import Link from 'next/link';

import { motion } from 'framer-motion';

interface Product {
    _id: string;
    title: string;
    price: number;
    category: string;
    images?: { url: string }[];
}

export default function FashionProductCard({ product }: { product: Product }) {
    const imageUrl = product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/400x600?text=No+Image';



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative block"
        >
            {/* Image Container with 3:4 Aspect Ratio */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <Link href={`/product/${product._id}`} className="block h-full w-full">
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {/* Hover Overlay / Glassmorphism actions - NOW OUTSIDE LINK */}

            </div>

            {/* Product Info */}
            <Link href={`/product/${product._id}`} className="block mt-4 space-y-1">
                <h3 className="text-gray-700 font-medium truncate group-hover:text-black transition-colors">
                    {product.title}
                </h3>
                <p className="text-gray-500 text-sm">{product.category}</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{Math.round(product.price * 1.4)}</span>
                    <span className="text-xs font-bold text-orange-500">(40% OFF)</span>
                </div>
            </Link>
        </motion.div>
    );
}
