'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { User, Package, LogOut, Mail, Phone, Shield } from 'lucide-react';

interface DecodedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<DecodedUser | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const decoded = jwtDecode<DecodedUser>(token);
            setUser(decoded);
        } catch (error) {
            localStorage.removeItem('token');
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (!mounted || !user) {
        return <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">Loading Profile...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-100">
                    <div className="relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User size={40} />
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                        <p className="text-gray-500 mb-4">{user.email}</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold capitalize">
                                <Shield size={12} />
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Personal Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={20} className="text-blue-600" /> Personal Information
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone size={12}/> Phone Number</p>
                                        <p className="font-medium text-gray-900">{user.phone || 'Not Verified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Actions */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                             <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                             <div className="grid grid-cols-2 gap-4">
                                <Link href="/orders" className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
                                    <Package size={24} className="text-gray-400 group-hover:text-blue-600 mb-2" />
                                    <h3 className="font-bold text-gray-800">My Orders</h3>
                                    <p className="text-xs text-gray-500">Track and view history</p>
                                </Link>
                                <Link href="/cart" className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
                                    <User size={24} className="text-gray-400 group-hover:text-blue-600 mb-2" />
                                    <h3 className="font-bold text-gray-800">Edit Profile</h3>
                                    <p className="text-xs text-gray-500">Update your details</p>
                                </Link>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-bold text-lg mb-1">ShopMate Member</h3>
                            <p className="text-blue-100 text-sm mb-6">Member since {new Date().getFullYear()}</p>
                            
                            <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <div>
                                    <p className="text-xs text-blue-200">Account Status</p>
                                    <p className="font-bold text-white">Active</p>
                                </div>
                                <Shield className="text-blue-300" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
