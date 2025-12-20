export default function Footer() {
    return (
        <footer className="bg-card border-t border-border mt-auto pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">

                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded font-bold text-lg leading-none">S</div>
                        <span className="text-xl font-bold text-foreground tracking-tight">ShopMate</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        Your premium destination for quality products. Experience shopping like never before with our curated collection.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-foreground font-semibold mb-6 tracking-wide text-xs uppercase">About</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Contact Us</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">About Us</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Careers</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Press Stories</a></li>
                    </ul>
                </div>

                {/* Help */}
                <div>
                    <h3 className="text-foreground font-semibold mb-6 tracking-wide text-xs uppercase">Help</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Payments</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Shipping</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">Returns</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors text-muted-foreground">FAQ</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-foreground font-semibold mb-6 tracking-wide text-xs uppercase">Office</h3>
                    <p className="leading-relaxed text-muted-foreground">
                        ShopMate Towers,<br />
                        Tech Village, ORR,<br />
                        Bengaluru, 560103,<br />
                        India
                    </p>
                    <div className="mt-4 flex gap-4">
                        {/* Social Icons Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                <div className="flex gap-6">
                    <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
                </div>
                <div>
                    <span>© {new Date().getFullYear()} ShopMate Inc. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
