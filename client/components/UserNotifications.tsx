"use client";


import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { playNotificationSound } from '../utils/playNotificationSound';

export default function UserNotifications() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            const userId = decoded.id || decoded._id; // Adjust based on your token payload

            // Connect to Socket
            socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');

            // Join User Room
            socketRef.current.emit('join-user', userId);
            console.log(`Joined room user - ${userId} `);

            // Listen for Order Updates
            socketRef.current.on('order-updated', (data: any) => {
                console.log("Order Updated:", data);

                // Play Sound
                playNotificationSound();

                // Show simple browser alert for now (or replace with toast)
                // Ideally use a Toast library like react-hot-toast or sonner
                // For this task, we will create a custom toast element or just log/alert

                // Create a temporary toast element
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-white border border-l-4 border-blue-500 rounded shadow-lg p-4 z-50 animate-in slide-in-from-right';
                toast.innerHTML = `
    < div class="flex items-center" >
                        <div class="flex-shrink-0 text-blue-500">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">Order Updated</p>
                            <p class="text-sm text-gray-500">${data.message}</p>
                        </div>
                    </div >
    `;
                document.body.appendChild(toast);

                // Remove after 5 seconds
                setTimeout(() => {
                    toast.remove();
                }, 5000);
            });

        } catch (e) {
            console.error("User Notification Error", e);
        }

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    return null; // Headless component
}
