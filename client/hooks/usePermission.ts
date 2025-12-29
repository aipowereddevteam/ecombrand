'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedUser {
    id: string;
    role: string;
    // We assume backend might later include assignedModules in token, 
    // OR we might need to fetch them if the token is old.
    // For now, let's fetch profile if not in token.
    assignedModules?: string[];
}

// In a real robust app, we would use a Context/Provider to store the user profile globally
// to avoid fetching it everywhere. For now, we'll implement a simple fetching strategy or assume fetching.

import axios from 'axios';

export function usePermission(moduleName: string) {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkPermission = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setHasPermission(false);
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode<DecodedUser>(token);

                // Super Admin bypass
                if (decoded.role === 'admin') {
                    setHasPermission(true);
                    setLoading(false);
                    return;
                }

                // For other roles, we need to check assignedModules.
                // Since assignedModules might not be in the lightweight JWT (unless we put it there),
                // we should fetch it. Ideally, user state should be global (Redux/Zustand/Context).
                // For this implementation, let's fetch from the API endpoint I just made: /user/profile

                // OPTIMIZATION: Check if we have user profile in localStorage or Context?
                // Let's call the API for now.

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                // Wait, normal users can't call admin endpoints. 
                // We need `GET /api/user/profile` to return `assignedModules`.

                const { data } = await axios.get(`${apiUrl}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userModules = data.user.assignedModules || [];

                if (userModules.includes(moduleName)) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                }

            } catch (error) {
                console.error("Permission check failed", error);
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [moduleName]);

    return { hasPermission, loading };
}
