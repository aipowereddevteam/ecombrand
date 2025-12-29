'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield } from 'lucide-react';
import ProfileSidebar from './ProfileSidebar';
import { jwtDecode } from 'jwt-decode';

interface DecodedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface ProfileWrapperProps {
    children: React.ReactNode;
}

export default function ProfileWrapper({ children }: ProfileWrapperProps) {
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
        return <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-4">

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
