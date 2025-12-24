'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">

                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white text-slate-900 p-1.5 rounded font-bold text-lg leading-none">S</div>
                        <span className="text-2xl font-bold text-white tracking-tight">ShopMate</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Redefining fashion with premium quality and timeless designs. Your destination for the latest trends.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">Company</h3>
                    <ul className="space-y-3">
                        <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Sustainability</Link></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">Customer Care</h3>
                    <ul className="space-y-3">
                        <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Contact Support</Link></li>
                    </ul>
                </div>

                {/* Social / Newsletter */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">Connect</h3>
                    <p className="text-slate-400 mb-4">Subscribe to our newsletter for exclusive offers.</p>
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="bg-slate-800 border-none rounded px-4 py-2 text-white w-full focus:ring-1 focus:ring-white"
                        />
                        <button className="bg-white text-slate-900 px-4 py-2 rounded font-bold hover:bg-slate-200">
                            Join
                        </button>
                    </div>
                    <div className="flex gap-4">
                        {/* Icons */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer font-bold">f</div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer font-bold">in</div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer font-bold">tw</div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <div className="flex gap-6">
                    <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
                </div>
                <div>
                    <span>© {new Date().getFullYear()} ShopMate Inc. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
