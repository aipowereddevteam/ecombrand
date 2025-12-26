'use client';
import { useState } from 'react';
import { Star, ShieldCheck, MoreVertical, Edit, Trash2 } from 'lucide-react';

interface MediaItem {
    public_id: string; // Ensure this is matched with backend
    url: string;
    type: string;
}

interface ReviewUser {
    _id: string;
    name: string;
    avatar?: string;
}

interface Review {
    _id: string;
    user: ReviewUser | null; // User might be deleted
    rating: number;
    comment: string;
    media?: MediaItem[];
    createdAt: string;
    order?: string;
}

interface ReviewCardProps {
    review: Review;
    currentUserId: string | null;
    onEdit: (review: Review) => void;
    onDelete: (reviewId: string) => void;
    onMediaClick: (media: MediaItem[], index: number) => void;
}

export default function ReviewCard({ review, currentUserId, onEdit, onDelete, onMediaClick }: ReviewCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{review.user?.name || 'Anonymous User'}</div>
                        <div className="flex text-yellow-400 text-sm mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < review.rating ? "currentColor" : "none"}
                                    className={i < review.rating ? "" : "text-gray-300"}
                                />
                            ))}
                            <span className="ml-2 text-xs text-gray-400 font-medium">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Menu (Only for owner) */}
                <div className="relative">
                    {currentUserId && review.user?._id === currentUserId && (
                        <div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-8 bg-white shadow-xl border border-gray-100 rounded-lg py-1 w-32 z-20 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={() => {
                                                onEdit(review);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                onDelete(review._id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>

            {/* Media Gallery */}
            {review.media && review.media.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {review.media.map((item, idx) => (
                        <div
                            key={idx}
                            className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => onMediaClick(review.media || [], idx)}
                        >
                            {item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover pointer-events-none" />
                            ) : (
                                <img src={item.url} alt="Review" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            )}
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white">▶</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-3 inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                <ShieldCheck size={12} /> Verified Purchase
            </div>
        </div>
    );
}
