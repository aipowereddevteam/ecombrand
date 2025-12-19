'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, ChevronDown, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
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
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
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
                    <div className="relative w-full group">
                        <input
                            type="text"
                            placeholder="Search for anything..."
                            className="w-full py-3 px-12 rounded-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-gray-600 placeholder:text-gray-400 focus:outline-none"
                        />
                        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6">

                    {/* Login / User Menu */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-gray-50 py-1.5 px-2 rounded-full transition-all border border-transparent hover:border-gray-200"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="User"
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User size={20} />
                                    </div>
                                )}
                                <span className="font-semibold text-sm text-gray-700 max-w-[100px] truncate hidden lg:block">
                                    {user.name.split(' ')[0]}
                                </span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                                    <div className="px-4 py-3 mb-2 bg-gray-50/50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">Signed in as</p>
                                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                    </div>

                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin/dashboard"
                                            className="px-4 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                    )}

                                    <Link
                                        href="/profile"
                                        className="px-4 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={18} />
                                        My Profile
                                    </Link>

                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 rounded-lg text-red-600 flex items-center gap-3 text-sm font-medium transition-colors"
                                    >
                                        <LogOut size={18} />
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm">
                            Login
                        </Link>
                    )}

                    {/* Cart */}
                    <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
                        <ShoppingCart size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">2</span>
                    </Link>

                    {/* Mobile Menu Icon */}
                    <button className="md:hidden p-2 hover:bg-gray-100 rounded-full" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={24} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-xl animate-in slide-in-from-top-5">
                    <div className="relative w-full mb-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full py-2.5 px-10 rounded-xl bg-gray-50 focus:outline-none"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                    {user && user.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block py-3 px-4 hover:bg-gray-50 rounded-xl text-gray-700 font-medium">Dashboard</Link>
                    )}
                </div>
            )}
        </header>
    );
}
