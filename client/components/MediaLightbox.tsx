'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
    url: string;
    type: string;
}

interface MediaLightboxProps {
    media: MediaItem[];
    initialIndex: number;
    onClose: () => void;
}

export default function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
    }, [media.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    }, [media.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handleNext, handlePrev]);

    const currentItem = media[currentIndex];

    if (!currentItem) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            >
                <X size={32} />
            </button>

            {/* Navigation Buttons */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                    >
                        <ChevronRight size={48} />
                    </button>
                </>
            )}

            {/* Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {currentItem.type === 'video' ? (
                    <video
                        src={currentItem.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <img
                        src={currentItem.url}
                        alt="Review content"
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl select-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium">
                {currentIndex + 1} / {media.length}
            </div>
        </div>
    );
}
