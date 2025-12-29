'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Shield } from 'lucide-react';

export default function ProfileSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const isActive = (path: string) => {
        return pathname === path ?
            "block px-6 py-1 text-blue-600 font-bold border-l-4 border-blue-600 bg-blue-50" :
            "block px-6 py-1 text-gray-600 hover:text-blue-600";
    };

    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
            } catch (error) {
                console.error("Token error", error);
            }
        }
    }, []);

    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-white border-r border-gray-100 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar text-sm hidden md:block">
            <div className="py-4">

                {/* Staff Access Link */}
                {['admin', 'warehouse', 'accountant', 'account_manager'].includes(userRole) && (
                    <div className="mb-4 px-6">
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="w-full py-2 bg-gray-800 text-white font-bold rounded shadow hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Shield size={14} />
                            <span>Staff Panel</span>
                        </button>
                    </div>
                )}

                {/* Overview */}
                <div className="px-6 py-3 border-b border-gray-100">
                    <Link href="/profile" className={pathname === '/profile' ? "text-blue-600 font-bold" : "text-gray-500 hover:text-black"}>Overview</Link>
                </div>

                {/* Orders */}
                <div className="py-3 border-b border-gray-100">
                    <div className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ORDERS</div>
                    <Link href="/orders" className={isActive('/orders')}>Orders & Returns</Link>
                </div>

                {/* Credits */}
                {/* <div className="py-3 border-b border-gray-100">
                    <div className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CREDITS</div>
                    <div className="flex flex-col gap-1">
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Coupons</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Store Credit</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Cash</Link>
                    </div>
                </div> */}

                {/* Account */}
                {/* <div className="py-3 border-b border-gray-100">
                    <div className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ACCOUNT</div>
                    <div className="flex flex-col gap-1">
                        <Link href="/profile" className={isActive('/profile')}>Profile</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Saved Cards</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Saved UPI</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Addresses</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Delete Account</Link>
                    </div>
                </div> */}

                {/* Legal */}
                <div className="py-3">
                    <div className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">LEGAL</div>
                    <div className="flex flex-col gap-1">
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Terms of Use</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Privacy Center</Link>
                    </div>
                </div>

                <div className="py-3 mt-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full text-left px-6 py-1 text-red-500 font-bold hover:bg-red-50 flex items-center gap-2">
                        <LogOut size={16} /> Logout
                    </button>
                </div>

            </div>
        </div>
    );
}
