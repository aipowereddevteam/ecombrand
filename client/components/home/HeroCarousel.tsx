'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const banners = [
    {
        id: 1,
        title: "Summer Collection 2024",
        subtitle: "Upgrade your style with our premium selection.",
        cta: "Shop Men",
        link: "/?category=Men",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Elegant Ethnic Wear",
        subtitle: "Grace and beauty in every thread.",
        cta: "Shop Women",
        link: "/?category=Women",
        image: "https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Kids Fashion Week",
        subtitle: "Comfort meets style for your little ones.",
        cta: "Shop Kids",
        link: "/?category=Kids",
        image: "https://images.unsplash.com/photo-1542038784456-1ea0e932dc7b?q=80&w=2070&auto=format&fit=crop"
    }
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-100">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${banners[current].image})` }}
                    />
                    <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                        <div className="max-w-3xl text-white space-y-6">
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-7xl font-bold tracking-tight font-sans"
                            >
                                {banners[current].title}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg md:text-2xl font-light text-gray-100"
                            >
                                {banners[current].subtitle}
                            </motion.p>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Link 
                                    href={banners[current].link}
                                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    {banners[current].cta} <ArrowRight size={20} />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            
            {/* Dots */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
}
