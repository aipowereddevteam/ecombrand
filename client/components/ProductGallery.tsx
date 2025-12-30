"use client";

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface ProductGalleryProps {
    images: { public_id: string; url: string; type?: string }[];
    title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
    const [activeMedia, setActiveMedia] = useState(images[0] || { url: '', type: 'image' });
    
    React.useEffect(() => {
        if (images.length > 0) {
            setActiveMedia(images[0]);
        }
    }, [images]);

    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
    const [isZoomed, setIsZoomed] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeMedia.type === 'video') return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;

        setZoomStyle({
            backgroundImage: `url(${activeMedia.url})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: '250%'
        });
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4 h-full sticky top-24">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide py-1 px-1">
                {images.map((media, idx) => (
                    <div 
                        key={idx}
                        className={`
                            relative min-w-[60px] w-[60px] h-[75px] cursor-pointer border rounded-sm overflow-hidden flex-shrink-0
                            ${activeMedia.url === media.url ? 'border-pink-600 ring-1 ring-pink-600' : 'border-gray-200 hover:border-black'}
                        `}
                        onMouseEnter={() => setActiveMedia(media)}
                    >
                        {media.type === 'video' ? (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                                <video src={media.url} className="w-full h-full object-cover absolute inset-0 opacity-50" />
                                <Play size={20} className="text-gray-800 z-10 fill-current" />
                            </div>
                        ) : (
                            <img 
                                src={media.url} 
                                alt={`${title} thumbnail ${idx + 1}`} 
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Main Display */}
            <div 
                className={`relative flex-1 bg-white border border-gray-100 overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[600px] group ${activeMedia.type !== 'video' ? 'cursor-crosshair' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => activeMedia.type !== 'video' && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                {activeMedia.type === 'video' ? (
                    <video 
                        src={activeMedia.url} 
                        controls 
                        autoPlay 
                        muted 
                        loop
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <>
                        <img 
                            src={activeMedia.url} 
                            alt={title} 
                            className={`w-full h-full object-contain pointer-events-none transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isZoomed && (
                            <div 
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{
                                    ...zoomStyle,
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
