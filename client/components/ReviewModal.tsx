'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Star, X, Upload, Image as ImageIcon, Video } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: { id: string; name: string; image: string };
    orderId: string;
    existingReview?: { rating: number; comment: string; media?: { public_id: string; url: string; type: string }[] };
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, product, orderId, existingReview, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
    const [existingMedia, setExistingMedia] = useState<{ public_id: string; url: string; type: string }[]>([]);
    const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setPreviewUrls([]);
            setDeletedMediaIds([]); // reset deleted media IDs
            if (existingReview) {
                setRating(existingReview.rating);
                setComment(existingReview.comment);
                setExistingMedia(existingReview.media || []);
            } else {
                setRating(0);
                setComment('');
                setExistingMedia([]);
            }
        }
    }, [isOpen, existingReview]);

    // Cleanup previews
    useEffect(() => {
        return () => {
            previewUrls.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, [previewUrls]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video'
            }));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index].url);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    const removeExistingMedia = (index: number) => {
        const item = existingMedia[index];
        setDeletedMediaIds(prev => [...prev, item.public_id]);
        setExistingMedia(prev => prev.filter((_, i) => i !== index));
    };

    const submitReview = async () => {
        if (rating === 0) {
            alert("Please select a rating star.");
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            const formData = new FormData();
            formData.append('productId', product.id);
            formData.append('orderId', orderId);
            formData.append('rating', rating.toString());
            formData.append('comment', comment);

            if (deletedMediaIds.length > 0) {
                formData.append('deletedMediaIds', JSON.stringify(deletedMediaIds));
            }

            files.forEach(file => {
                formData.append('media', file);
            });

            await axios.post(`${apiUrl}/products/review`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert("Review submitted successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {existingReview ? 'Edit Review' : 'Write a Review'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">How was your experience with this product?</p>

                    <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                        <img src={product.image} alt={product.name} className="w-12 h-16 object-contain mix-blend-multiply" />
                        <div className="text-sm font-medium text-gray-700 line-clamp-2">{product.name}</div>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                type="button"
                                className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star
                                    fill={rating >= star ? "currentColor" : "none"}
                                    strokeWidth={rating >= star ? 0 : 1.5}
                                    size={32}
                                    className={rating >= star ? "drop-shadow-sm" : ""}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Review</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                            rows={4}
                            placeholder="Tell us what you liked or disliked..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Media Upload Section */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add Photos & Videos</label>

                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {/* Existing Media (Manageable) */}
                            {existingMedia.map((media, idx) => (
                                <div key={`exist-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                    {media.type === 'video' ? (
                                        <video src={media.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={media.url} alt="Review media" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeExistingMedia(idx)}
                                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Image"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/40 p-0.5 text-center">
                                        <span className="text-[10px] text-white font-medium">Saved</span>
                                    </div>
                                </div>
                            ))}

                            {/* New File Previews */}
                            {previewUrls.map((preview, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                                    {preview.type === 'video' ? (
                                        <video src={preview.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors bg-gray-50 hover:bg-blue-50"
                            >
                                <Upload size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">Add</span>
                            </button>
                        </div>

                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <p className="text-xs text-gray-400">Upload photos or videos from your gallery/camera.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitReview}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
