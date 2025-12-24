'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield } from 'lucide-react';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import { jwtDecode } from 'jwt-decode';

interface DecodedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
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

    if (!mounted) return null; // Prevent hydration mismatch

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-4">
                
                {/* Header Card */}
                <div className="bg-white rounded-none md:rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b md:border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-100" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User size={40} />
                                </div>
                            )}
                            <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
                        </div>
                        
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h1>
                            {user.role === 'admin' && (
                                <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md w-fit">
                                    <Shield size={12} fill="currentColor" />
                                    <span>Admin Account</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-2 border border-red-200 text-red-500 hover:text-white hover:bg-red-500 rounded-md transition-colors font-bold text-sm uppercase tracking-wide"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 h-full">
                    {/* Sidebar */}
                    <ProfileSidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white border border-gray-100 h-[calc(100vh-220px)] overflow-y-auto p-8 md:p-12 relative custom-scrollbar">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}
