export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">

                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded font-bold text-lg leading-none">S</div>
                        <span className="text-xl font-bold text-white tracking-tight">ShopMate</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Your premium destination for quality products. Experience shopping like never before with our curated collection.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">About</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Press Stories</a></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">Help</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Payments</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Shipping</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Returns</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white font-semibold mb-6 tracking-wide text-xs uppercase">Office</h3>
                    <p className="leading-relaxed text-slate-400">
                        ShopMate Towers,<br />
                        Tech Village, ORR,<br />
                        Bengaluru, 560103,<br />
                        India
                    </p>
                    <div className="mt-4 flex gap-4">
                        {/* Social Icons Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <div className="flex gap-6">
                    <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                </div>
                <div>
                    <span>© 2025 ShopMate Inc. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
