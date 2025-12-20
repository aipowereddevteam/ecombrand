'use client';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: { public_id: string; url: string }[];
}

function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/products`, {
                    params: { keyword }
                });
                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching products", error);
            }
        };
        fetchProducts();
    }, [keyword]);
    
    // ... rest of component logic related to rendering ...
    
    // BUT we need to return the JSX here, so I will rewrite the whole component to be safe or swap the internal logic.
    // Given the structure, I'll rewrite the component to wrap the list in Suspense as required by useSearchParams in Next 15+ or generally good practice.
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.length > 0 ? products.map(product => (
                <Link href={`/product/${product._id}`} key={product._id} className="border border-border p-4 hover:shadow-lg transition-all flex flex-col group cursor-pointer block bg-card rounded-xl hover:border-primary/50">
                    <div className="h-48 w-full mb-4 flex items-center justify-center relative bg-muted/20 rounded-lg p-4">
                        <img
                            src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/150'}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform mix-blend-multiply dark:mix-blend-normal"
                        />
                    </div>
                    <h3 className="font-medium text-foreground truncate mb-1" title={product.title}>{product.title}</h3>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="font-bold text-lg text-foreground">₹{product.price}</span>
                        <span className="text-muted-foreground line-through text-sm">₹{Math.round(product.price * 1.2)}</span>
                        <span className="text-green-600 text-sm font-medium">20% off</span>
                    </div>
                    <span className="text-xs text-muted-foreground mb-2">Free delivery</span>
                </Link>
            )) : (
                <div className="col-span-4 text-center py-10 text-muted-foreground">
                    {keyword ? `No products found for "${keyword}"` : 'Loading products...'}
                </div>
            )}
        </div>
    );
}

export default function Home() {
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
        <div className="min-h-screen bg-background pb-10">

            {/* Categories Row */}
            <div className="bg-card shadow-sm border-b border-border mb-4">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                    {categories.map((cat, i) => (
                        <div key={i} className="flex flex-col items-center cursor-pointer min-w-[64px] group">
                            <div className="h-16 w-16 mb-1 bg-muted rounded-full p-2">
                                <img src={cat.img} alt={cat.name} className="h-full w-full object-contain mix-blend-multiply" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero Banner (Static for now) */}
            <div className="max-w-7xl mx-auto px-2 mb-4">
                <div className="relative w-full h-48 md:h-72 bg-muted rounded-xl overflow-hidden">
                    <img
                        src="https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/1e174e2d4d9b7100.jpg"
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-2">
                <div className="bg-card p-4 shadow-sm rounded-xl border border-border">
                    <h2 className="text-xl font-bold mb-4 text-foreground">Suggested for You</h2>
                    <Suspense fallback={<div>Loading Products...</div>}>
                        <ProductList />
                    </Suspense>
                </div>
            </div>

        </div>
    );
}
