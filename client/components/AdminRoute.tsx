'use client';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    role: string;
    exp: number;
}

export default function AdminRoute({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.role !== 'admin') {
                router.push('/');
            } else {
                setAuthorized(true);
            }
        } catch (error) {
            localStorage.removeItem('token');
            router.push('/login');
        }
    }, [router]);

    if (!authorized) {
        return <div className="flex justify-center items-center h-screen">Loading Admin Access...</div>;
    }

    return <>{children}</>;
}
