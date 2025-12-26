'use client';
import { useState, useEffect, useRef, useCallback, use } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Filter } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import ReviewModal from '@/components/ReviewModal';
import MediaLightbox from '@/components/MediaLightbox';

interface Review {
    _id: string;
    user: { _id: string; name: string; avatar?: string } | null;
    rating: number;
    comment: string;
    media?: { public_id: string; url: string; type: string }[];
    createdAt: string;
    order?: string;
}

interface ProductInfo {
    _id: string;
    title: string;
    images: { url: string }[];
    price: number;
    ratings: number;
    numOfReviews: number;
}

export default function ProductReviewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Sort & Filter
    const [sortBy, setSortBy] = useState('newest');

    // Modals
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; media: any[]; index: number }>({
        isOpen: false, media: [], index: 0
    });

    // Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastReviewRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch Product Info (Once)
    useEffect(() => {
        const fetchProduct = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const res = await axios.get(`${apiUrl}/products/${id}`);
                setProduct(res.data.product);
                if (res.data.distribution) setDistribution(res.data.distribution);
            } catch (err) {
                console.error(err);
            }
        };
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUserId(payload.id);
        }
        fetchProduct();
    }, [id]);

    // Fetch Reviews (On Page/Sort Change)
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            try {
                const res = await axios.get(`${apiUrl}/products/reviews/${id}?page=${page}&limit=5&sort=${sortBy}`);

                if (page === 1) {
                    setReviews(res.data.reviews);
                } else {
                    setReviews(prev => [...prev, ...res.data.reviews]);
                }

                // Check if we reached the end
                if (res.data.reviews.length < 5) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [id, page, sortBy]);

    // Refresh single review or list after edit/delete
    const refreshReviews = () => {
        setPage(1); // Reset to page 1 to refresh list safely
        setHasMore(true);
        // Effect will trigger fetch
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.delete(`${apiUrl}/products/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from local state immediately
            setReviews(prev => prev.filter(r => r._id !== reviewId));
        } catch (error) {
            console.error(error);
            alert("Failed to delete review");
        }
    };

    if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Reviews for {product.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                            <Filter size={14} />
                            {sortBy === 'newest' ? 'Newest First' : sortBy === 'rating' ? 'Highest Rated' : 'Oldest First'}
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <button onClick={() => { setSortBy('newest'); setPage(1); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm">Newest First</button>
                            <button onClick={() => { setSortBy('rating'); setPage(1); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm">Highest Rated</button>
                            <button onClick={() => { setSortBy('oldest'); setPage(1); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm">Oldest First</button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Product Summary (Sticky) */}
                    <div className="lg:w-[30%]">
                        <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <img src={product.images[0]?.url} alt={product.title} className="w-full aspect-square object-contain mb-4 mix-blend-multiply" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h2>
                            <p className="text-2xl font-bold text-gray-900 mb-6">₹{product.price}</p>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-4xl font-bold text-gray-900">{product.ratings.toFixed(1)}</span>
                                <div className="text-yellow-400">
                                    <Star size={24} fill="currentColor" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">Based on {product.numOfReviews} reviews</p>

                            {/* Ratings Distribution */}
                            <div className="space-y-2 mb-6">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = distribution[star] || 0;
                                    const percent = product.numOfReviews > 0 ? (count / product.numOfReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center text-sm gap-3">
                                            <div className="w-12 font-bold text-gray-700 whitespace-nowrap flex items-center justify-end">{star} Stars</div>
                                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="w-6 text-gray-400 text-xs text-right">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Review Button (Optional context hook? Or simplistic) */}
                            {/* In real app, might need to check if ordered, but for now we won't put 'Write Review' here to avoid context complexity with 'orders' page logic unless requested. */}
                        </div>
                    </div>

                    {/* Right Column: Reviews List */}
                    <div className="lg:w-[70%] space-y-4">
                        {reviews.length === 0 && !loading ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500">No reviews found.</p>
                            </div>
                        ) : (
                            reviews.map((review, index) => {
                                if (reviews.length === index + 1) {
                                    // Last element
                                    return (
                                        <div ref={lastReviewRef} key={review._id}>
                                            <ReviewCard
                                                review={review}
                                                currentUserId={currentUserId}
                                                onEdit={(r) => { setEditingReview(r); setIsReviewModalOpen(true); }}
                                                onDelete={handleDeleteReview}
                                                onMediaClick={(media, idx) => setLightboxState({ isOpen: true, media, index: idx })}
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <ReviewCard
                                            key={review._id}
                                            review={review}
                                            currentUserId={currentUserId}
                                            onEdit={(r) => { setEditingReview(r); setIsReviewModalOpen(true); }}
                                            onDelete={handleDeleteReview}
                                            onMediaClick={(media, idx) => setLightboxState({ isOpen: true, media, index: idx })}
                                        />
                                    );
                                }
                            })
                        )}
                        {loading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => { setIsReviewModalOpen(false); setEditingReview(null); }}
                product={{ id: product._id, name: product.title, image: product.images[0]?.url || '' }}
                orderId={editingReview?.order || ''}
                existingReview={editingReview || undefined}
                onSuccess={refreshReviews}
            />

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
