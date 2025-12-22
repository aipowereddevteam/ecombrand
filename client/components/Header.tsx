'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ChevronDown, Menu, LogOut, Package } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface DecodedUser {
    name: string;
    avatar: string;
    role: string;
}

export default function Header() {
    const router = useRouter();
    const { cartItems } = useSelector((state: RootState) => state.cart || { cartItems: [] });
    const [user, setUser] = useState<DecodedUser | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedUser>(token);
                setUser({
                    name: decoded.name || 'User',
                    avatar: decoded.avatar,
                    role: decoded.role
                });
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsDropdownOpen(false);
        router.push('/login');
    };

    return (
        <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xl leading-none">
                        S
                    </div>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        ShopMate
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-xl mx-auto">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('search') as HTMLInputElement;
                            if (input.value.trim()) {
                                router.push(`/?keyword=${input.value.trim()}`);
                            } else {
                                router.push('/');
                            }
                        }}
                        className="relative w-full group">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search for anything..."
                            className="w-full py-3 px-12 rounded-full bg-accent/50 border border-transparent focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <button type="submit">
                            <Search className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        </button>
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 lg:gap-6">

                    {/* Notification Bell (Admin Only) */}
                    {user && user.role === 'admin' && (
                        <NotificationBell />
                    )}

                    {/* Login / User Menu */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-accent py-1.5 px-2 rounded-full transition-all border border-transparent hover:border-border"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="User"
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User size={20} />
                                    </div>
                                )}
                                <span className="font-semibold text-sm text-foreground max-w-[100px] truncate hidden lg:block">
                                    {user.name.split(' ')[0]}
                                </span>
                                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                                    <div className="px-4 py-3 mb-2 bg-muted/50 rounded-xl">
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Signed in as</p>
                                        <p className="font-bold text-foreground truncate">{user.name}</p>
                                    </div>

                                    {user.role === 'admin' && (
                                        <>
                                            <Link
                                                href="/admin/dashboard"
                                                className="px-4 py-2.5 hover:bg-accent rounded-lg flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Package size={18} />
                                                Admin Dashboard
                                            </Link>
                                            <Link
                                                href="/admin/orders"
                                                className="px-4 py-2.5 hover:bg-accent rounded-lg flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Package size={18} />
                                                Manage Orders
                                            </Link>
                                        </>
                                    )}

                                    <Link
                                        href="/orders"
                                        className="px-4 py-2.5 hover:bg-accent rounded-lg flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Package size={18} />
                                        My Orders
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="px-4 py-2.5 hover:bg-accent rounded-lg flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={18} />
                                        My Profile
                                    </Link>

                                    <div className="h-px bg-border my-2"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 hover:bg-destructive/10 rounded-lg text-destructive flex items-center gap-3 text-sm font-medium transition-colors"
                                    >
                                        <LogOut size={18} />
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm">
                            Login
                        </Link>
                    )}

                    {/* Cart */}
                    <Link href="/cart" className="relative p-2 hover:bg-accent rounded-full transition-colors group">
                        <ShoppingCart size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        {mounted && cartItems.length > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-background">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Icon */}
                    <button className="md:hidden p-2 hover:bg-accent rounded-full" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={24} className="text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-xl animate-in slide-in-from-top-5">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('searchMobile') as HTMLInputElement;
                            if (input.value.trim()) {
                                router.push(`/?keyword=${input.value.trim()}`);
                            } else {
                                router.push('/');
                            }
                        }}
                        className="relative w-full mb-4">
                        <input
                            type="text"
                            name="searchMobile"
                            placeholder="Search..."
                            className="w-full py-2.5 px-10 rounded-xl bg-gray-50 focus:outline-none"
                        />
                        <button type="submit">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        </button>
                    </form>
                    {user && user.role === 'admin' && (
                        <>
                            <Link href="/admin/dashboard" className="block py-3 px-4 hover:bg-gray-50 rounded-xl text-gray-700 font-medium">Admin Dashboard</Link>
                            <Link href="/admin/orders" className="block py-3 px-4 hover:bg-gray-50 rounded-xl text-gray-700 font-medium">Manage Orders</Link>
                        </>
                    )}
                    <Link href="/orders" className="block py-3 px-4 hover:bg-gray-50 rounded-xl text-gray-700 font-medium">My Orders</Link>
                </div>
            )}
        </header>
    );
}
