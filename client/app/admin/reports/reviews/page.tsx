'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RatingStat {
    _id: number;
    count: number;
}

interface Review {
    _id: string;
    rating: number;
    comment: string;
    user: { name: string };
    product: { title: string };
    createdAt: string;
}

export default function ReviewsReport() {
    const [ratingStats, setRatingStats] = useState<RatingStat[]>([]);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState({ avgRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api/v1';

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(
                `${apiUrl}/admin/reports/reviews?range=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Fill missing stars for chart consistency
            const fullStats = [5, 4, 3, 2, 1].map(star => {
                const found = data.ratingDistribution.find((r: RatingStat) => r._id === star);
                return { _id: star, count: found ? found.count : 0 };
            });

            setRatingStats(fullStats);
            setRecentReviews(data.recentReviews);
            setSummary({ avgRating: data.avgRating, totalReviews: data.totalReviews });
        } catch (error) {
            console.error('Error fetching review analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [dateRange]);

    const RATING_COLORS = {
        5: '#10B981', // Green
        4: '#3B82F6', // Blue
        3: '#F59E0B', // Yellow
        2: '#F97316', // Orange
        1: '#EF4444'  // Red
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">⭐ Reviews & Ratings</h1>
                    <p className="text-gray-600">Customer sentiment and product feedback</p>
                </div>
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center justify-center text-center col-span-1">
                    <p className="text-gray-500 font-medium mb-2">Average Rating</p>
                    <h2 className="text-6xl font-black text-gray-900 mb-2">{summary.avgRating}</h2>
                    <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={24} 
                                className={`${star <= Math.round(summary.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">Based on {summary.totalReviews} reviews</p>
                </div>

                {/* Rating Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={ratingStats}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={30} tickFormatter={(val) => `${val}★`} fontWeight="bold" />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" name="Reviews" radius={[0, 4, 4, 0]} barSize={24}>
                                    {ratingStats.map((entry) => (
                                        <Cell key={entry._id} fill={(RATING_COLORS as any)[entry._id]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Reviews List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <MessageSquare className="mr-2 text-blue-500" size={20} />
                        Recent Feedback
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentReviews.length === 0 ? (
                        <p className="p-8 text-center text-gray-500">No reviews found in this period.</p>
                    ) : (
                        recentReviews.map((review) => (
                            <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center">
                                        <div className="flex mr-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 mr-2">{review.user?.name || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${review.rating >= 4 ? 'bg-green-100 text-green-700' : review.rating <= 2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {review.rating >= 4 ? 'Positive' : review.rating <= 2 ? 'Critical' : 'Neutral'}
                                    </span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">{review.product?.title || 'Unknown Product'}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
