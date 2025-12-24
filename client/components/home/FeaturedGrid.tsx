'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const gridItems = [
    {
        id: 1,
        title: "Men's Casual",
        link: "/?category=Men",
        size: "large", // spans 2 cols
        image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1587&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Women's Ethnic",
        link: "/?category=Women",
        size: "normal",
        image: "https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=687&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Activewear",
        link: "/?category=Sports",
        size: "normal",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop"
    },
    {
        id: 4,
        title: "Gen Z Trends",
        link: "/?category=GenZ",
        size: "wide", // spans full width
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop"
    }
];

export default function FeaturedGrid() {
    return (
        <section className="py-16 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 tracking-tight font-sans">SHOP BY CATEGORY</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px] md:h-[600px]">
                {gridItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                            item.size === 'large' ? 'md:col-span-2 md:row-span-2' :
                            item.size === 'wide' ? 'md:col-span-2 md:row-span-1' :
                            'md:col-span-1 md:row-span-1'
                        }`}
                    >
                        <Link href={item.link} className="block h-full w-full">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                                    <span className="font-bold text-gray-900 uppercase tracking-widest text-sm md:text-base">
                                        {item.title}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
