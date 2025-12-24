'use client';

export default function PromoStrip({ text, bgColor = "bg-slate-900", textColor = "text-white" }: { text: string; bgColor?: string; textColor?: string }) {
    return (
        <div className={`${bgColor} ${textColor} py-3 px-4 text-center font-medium tracking-wide text-sm md:text-base uppercase`}>
            {text}
        </div>
    );
}
