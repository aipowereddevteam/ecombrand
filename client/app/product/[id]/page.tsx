'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import { RootState, AppDispatch } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, ShoppingBag, Zap, Truck, ShieldCheck, Heart, MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import ReviewModal from '@/components/ReviewModal';
import MediaLightbox from '@/components/MediaLightbox';
import ReviewCard from '@/components/ReviewCard';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';

interface ProductDetail {
    _id: string;
    title: string;
    description: string;
    price: number;
    images: { public_id: string; url: string; type?: string }[];
    stock: { [key: string]: number };
    ratings: number;
    numOfReviews: number;
}

interface Review {
    _id: string;
    user: { _id: string; name: string; avatar?: string } | null;
    rating: number;
    comment: string;
    media?: { public_id: string; url: string; type: string }[];
    createdAt: string;
    order?: string; // Order ID reference
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'rating'
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const wishlist = useSelector((state: RootState) => state.wishlist.items);

    // Review Lifecycle State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; media: any[]; index: number }>({
        isOpen: false,
        media: [],
        index: 0
    });

    useEffect(() => {
        // Simple check for user ID from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id);
            } catch (e) { console.error("Invalid token"); }
        }

        const fetchProductAndReviews = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                // Parallel fetch
                const [productRes, reviewsRes, relatedRes] = await Promise.all([
                    axios.get(`${apiUrl}/products/${id}`),
                    axios.get(`${apiUrl}/products/reviews/${id}?sort=${sortBy}`),
                    axios.get(`${apiUrl}/products/related/${id}`)
                ]);

                setProduct(productRes.data.product);
                if (productRes.data.distribution) setDistribution(productRes.data.distribution);

                setReviews(reviewsRes.data.reviews);
                setRelatedProducts(relatedRes.data.products);

                // Default select first available size if possible
                if (productRes.data.product.stock) {
                    const sizes = Object.keys(productRes.data.product.stock).filter(s => productRes.data.product.stock[s] > 0);
                    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProductAndReviews();
    }, [id, sortBy]);

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setIsReviewModalOpen(true);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.delete(`${apiUrl}/products/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh
            const reviewsRes = await axios.get(`${apiUrl}/products/reviews/${id}?sort=${sortBy}`);
            setReviews(reviewsRes.data.reviews);
            // Also update product stats locally or re-fetch product
            const productRes = await axios.get(`${apiUrl}/products/${id}`);
            setProduct(productRes.data.product);
            if (productRes.data.distribution) setDistribution(productRes.data.distribution);

            alert("Review deleted.");
        } catch (error) {
            console.error(error);
            alert("Failed to delete review");
        }
    };


    const addToCartHandler = () => {
        if (!product) return;
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
        if (!product) return;
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
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-8 pb-16">

                {/* Main Grid: 12 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative">

                    {/* Left Column: Staggered Image Grid (Cols 1-7) */}
                    {/* Left Column: Product Gallery (Cols 1-7) */}
                    <div className="lg:col-span-7">
                        {product.images && product.images.length > 0 ? (
                            <ProductGallery images={product.images} title={product.title} />
                        ) : (
                            <img src="https://via.placeholder.com/800x1000" alt="Placeholder" className="w-full" />
                        )}
                    </div>

                    {/* Right Column: Sticky Details (Cols 8-12) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 space-y-8 h-fit overflow-y-auto max-h-[calc(100vh-6rem)] scrollbar-hide pb-12">

                            {/* Header */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-tight tracking-tight">
                                        {product.title}
                                    </h1>
                                    <button
                                        onClick={() => dispatch(toggleWishlist(product._id))}
                                        className="p-3 hover:bg-gray-50 rounded-full transition-colors group"
                                    >
                                        <Heart
                                            size={24}
                                            className={`transition-colors ${wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-500"}`}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-medium font-sans text-gray-900">₹{product.price}</span>
                                    <span className="text-xl text-gray-400 line-through font-sans">₹{Math.round(product.price * 1.3)}</span>
                                    <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">(30% OFF)</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex text-black gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < Math.round(product.ratings) ? "currentColor" : "none"}
                                                className={i < Math.round(product.ratings) ? "text-black" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-widest pl-2 border-l border-gray-300 ml-2">
                                        {product.numOfReviews} Ratings
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full" />

                            {/* Description */}
                            <div className="prose prose-sm text-gray-600 font-light leading-relaxed">
                                <p>{product.description}</p>
                            </div>

                            {/* Size Selector */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Select Size</h3>
                                    <button className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1">
                                        SIZE CHART <span className="text-[10px]">❯</span>
                                    </button>
                                </div>
                                <div className="flex gap-3 flex-wrap">
                                    {product.stock && Object.keys(product.stock).map((size) => (
                                        <button
                                            key={size}
                                            disabled={product.stock[size] <= 0}
                                            onClick={() => setSelectedSize(size)}
                                            className={`
                                                w-12 h-12 flex items-center justify-center rounded-full border font-bold text-sm transition-all
                                                ${selectedSize === size
                                                    ? 'border-pink-500 text-pink-500 ring-1 ring-pink-500'
                                                    : 'border-gray-300 text-gray-900 hover:border-black'}
                                                ${product.stock[size] <= 0 ? 'opacity-40 cursor-not-allowed bg-gray-50 diagonal-strike' : ''}
                                            `}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {selectedSize && (
                                    <p className="text-xs text-red-500 font-medium animate-pulse">
                                        {product.stock[selectedSize] < 5 && product.stock[selectedSize] > 0 && `Only ${product.stock[selectedSize]} left!`}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <button
                                    onClick={addToCartHandler}
                                    className="h-14 bg-[#ff3f6c] text-white text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity rounded-[4px] flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={20} />
                                    Add to Bag
                                </button>
                                <button
                                    onClick={() => dispatch(toggleWishlist(product._id))}
                                    className="h-14 bg-white text-gray-900 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:border-gray-900 transition-colors rounded-[4px] flex items-center justify-center gap-2"
                                >
                                    <Heart
                                        size={20}
                                        className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-900"}
                                    />
                                    Wishlist
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                                <div className="flex flex-col gap-1">
                                    <Truck size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-bold uppercase text-gray-900">Free Shipping</span>
                                    <span className="text-xs text-gray-500">On orders over ₹2000</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <ShieldCheck size={20} strokeWidth={1.5} />
                                    <span className="text-xs font-bold uppercase text-gray-900">Authentic</span>
                                    <span className="text-xs text-gray-500">100% Original Products</span>
                                </div>
                            </div>

                            {/* Reviews Preview (Simplified) */}
                            <div className="pt-12 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-serif text-xl font-bold">Reviews</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-serif">{product.ratings.toFixed(1)}</span>
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {reviews.slice(0, 2).map((review) => (
                                        <div key={review._id} className="pb-6 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sm text-gray-900">{review.user?.name || 'Anonymous'}</span>
                                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                                        </div>
                                    ))}

                                    {reviews.length > 0 && (
                                        <Link
                                            href={`/product/${id}/reviews`}
                                            className="block w-full py-3 text-center text-xs font-bold uppercase border border-gray-200 hover:border-black transition-colors mt-4"
                                        >
                                            Read All {reviews.length} Reviews
                                        </Link>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 py-12 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-3xl text-gray-900">Related Products</h2>
                            <Link href="/products" className="text-sm border-b border-black pb-0.5 hover:opacity-70 transition-opacity">View All</Link>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-8 lg:px-0">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Modals */}
            {product && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setEditingReview(null);
                    }}
                    product={{
                        id: product._id,
                        name: product.title,
                        image: product.images[0]?.url || ''
                    }}
                    orderId={editingReview?.order || ''}
                    existingReview={editingReview ? {
                        rating: editingReview.rating,
                        comment: editingReview.comment,
                        media: editingReview.media
                    } : undefined}
                    onSuccess={async () => {
                        // Refresh reviews
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                        const reviewsRes = await axios.get(`${apiUrl}/products/reviews/${id}?sort=${sortBy}`);
                        setReviews(reviewsRes.data.reviews);
                        // Refresh product stats
                        const productRes = await axios.get(`${apiUrl}/products/${id}`);
                        setProduct(productRes.data.product);
                        if (productRes.data.distribution) setDistribution(productRes.data.distribution);
                    }}
                />
            )}

            {lightboxState.isOpen && (
                <MediaLightbox
                    media={lightboxState.media}
                    initialIndex={lightboxState.index}
                    onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
                />
            )}

        </div>
    );
}
