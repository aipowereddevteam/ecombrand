'use client';
import Link from 'next/link';

const categories = [
    { name: "Men", image: "https://images.unsplash.com/photo-1488161628813-99c974fc7994?q=80&w=200&auto=format&fit=crop" },
    { name: "Women", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=200&auto=format&fit=crop" },
    { name: "Kids", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=200&auto=format&fit=crop" },
    { name: "Home", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&auto=format&fit=crop" },
    { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=200&auto=format&fit=crop" },
    { name: "Gen Z", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop" },
];

export default function CategoryRail() {
    return (
        <div className="py-8 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-8 md:gap-12 min-w-max justify-start md:justify-center px-4">
                    {categories.map((cat, idx) => (
                        <Link key={idx} href={`/?category=${cat.name}`} className="group flex flex-col items-center gap-3">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                                    <img 
                                        src={cat.image} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors tracking-wide uppercase">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
