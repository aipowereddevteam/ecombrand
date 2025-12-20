'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Zap, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ProductDetails({ params }) {
    // Unwrap params using React.use() if needed in newer Next.js or just access directly depending on version.
    // However, since we are 'use client', we can standardly rely on the prop or use useParams hook.
    // For safety with async params in newer Next.js versions:
    const { id } = use(params);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/products/${id}`);
                setProduct(data.product);
                // Default select first available size if possible
                if (data.product.stock) {
                    const sizes = Object.keys(data.product.stock).filter(s => data.product.stock[s] > 0);
                    if (sizes.length > 0) setSelectedSize(sizes[0]);
                }
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        dispatch(addToCart({
            product: product._id,
            name: product.title,
            price: product.price,
            image: product.images[0]?.url,
            stock: product.stock[selectedSize],
            quantity,
            size: selectedSize
        }));
        alert("Added to Cart!");
    };

    const buyNowHandler = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        dispatch(addToCart({
            product: product._id,
            name: product.title,
            price: product.price,
            image: product.images[0]?.url,
            stock: product.stock[selectedSize],
            quantity,
            size: selectedSize
        }));
        router.push('/shipping');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">

                    {/* Image Section */}
                    <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8 relative">
                        <img
                            src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/400'}
                            alt={product.title}
                            className="max-h-[500px] w-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-6 border-b pb-6">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
                            <p className="text-sm text-gray-500 mb-4">Product ID: {product._id}</p>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                                <span className="text-xl text-gray-400 line-through">₹{Math.round(product.price * 1.3)}</span>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">30% OFF</span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4].map(i => <Star key={i} size={18} fill="currentColor" />)}
                                    <Star size={18} className="text-gray-300" fill="currentColor" />
                                </div>
                                <span className="text-sm text-gray-500">(124 Reviews)</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Size Selector */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Select Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.stock && Object.keys(product.stock).map((size) => (
                                    <button
                                        key={size}
                                        disabled={product.stock[size] <= 0}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold transition-all
                                            ${selectedSize === size
                                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                : 'border-gray-200 text-gray-600 hover:border-blue-300'}
                                            ${product.stock[size] <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                                        `}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedSize && product.stock && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    {product.stock[selectedSize] > 0 ? `In Stock (${product.stock[selectedSize]} available)` : 'Out of Stock'}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={addToCartHandler}
                                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                <ShoppingCart size={20} />
                                Add to Cart
                            </button>
                            <button
                                onClick={buyNowHandler}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                            >
                                <Zap size={20} />
                                Buy Now
                            </button>
                        </div>

                        {/* Service Features */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck className="text-blue-500" size={20} />
                                <span>Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <ShieldCheck className="text-blue-500" size={20} />
                                <span>1 Year Warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
