'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 
            "block px-6 py-1 text-blue-600 font-bold border-l-4 border-blue-600 bg-blue-50" : 
            "block px-6 py-1 text-gray-600 hover:text-blue-600";
    };

    return (
        <div className="w-full md:w-64 flex-shrink-0 bg-white border-r border-gray-100 min-h-[600px] text-sm hidden md:block">
            <div className="py-4">
                
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
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Myntra Credit</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">MynCash</Link>
                    </div>
                </div> */}

                {/* Account */}
                {/* <div className="py-3 border-b border-gray-100">
                    <div className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ACCOUNT</div>
                    <div className="flex flex-col gap-1">
                        <Link href="/profile" className={isActive('/profile')}>Profile</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Saved Cards</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Saved UPI</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Saved Wallets/BNPL</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Addresses</Link>
                        <Link href="#" className="block px-6 py-1 text-gray-600 hover:text-blue-600">Myntra Insider</Link>
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

            </div>
        </div>
    );
}
