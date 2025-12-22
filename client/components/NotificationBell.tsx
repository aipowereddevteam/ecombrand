"use client";


import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell } from 'lucide-react';
import { playNotificationSound } from '../utils/playNotificationSound';

interface Notification {
    _id: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Fetch existing notifications
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');

                let apiUrl = process.env.NEXT_PUBLIC_API_URL;
                // Validate API URL (check if it's a valid http/https string)
                if (!apiUrl || !apiUrl.startsWith('http')) {
                    console.warn("Invalid or missing NEXT_PUBLIC_API_URL, falling back to default.");
                    apiUrl = 'http://localhost:5000/api';
                }

                const url = `${apiUrl}/notifications`;
                console.log("Fetching notifications from:", url);

                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log("Response Status:", res.status);
                const contentType = res.headers.get("content-type");

                if (!res.ok) {
                    const text = await res.text();
                    console.error(`API Error (${res.status}):`, text.substring(0, 100)); // Log first 100 chars
                    return;
                }

                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setNotifications(data);
                        setUnreadCount(data.length);
                    }
                } else {
                    const text = await res.text();
                    console.error("Received non-JSON response:", text.substring(0, 100));
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();

        const getSocketUrl = () => {
            let url = process.env.NEXT_PUBLIC_API_URL;
            if (!url || !url.startsWith('http')) {
                return 'http://localhost:5000';
            }
            return url.replace('/api', '');
        };

        socketRef.current = io(getSocketUrl());

        socketRef.current.emit('join-admin');

        socketRef.current.on('new-order', (data: any) => {
            console.log("New Order Received:", data);

            // Play Sound
            playNotificationSound();

            // Add to list
            const newNotification: Notification = {
                _id: data._id,
                message: data.message,
                link: data.link,
                isRead: false,
                createdAt: data.createdAt
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // API Call
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await fetch(`${apiUrl}/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const clearAll = async () => {
        try {
            // Optimistic update
            setNotifications([]);
            setUnreadCount(0);

            // API Call
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await fetch(`${apiUrl}/notifications/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    return (
        <div className="relative">
            <button onClick={toggleDropdown} className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div ref={dropdownRef} className="absolute right-0 w-80 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-900">Notifications</p>
                        {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-800">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div>
                        ) : (
                            notifications.map((notification) => (
                                <div key={notification._id} className={`px-4 py-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{notification.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <button onClick={() => markAsRead(notification._id)} className="ml-2 text-xs text-blue-600 hover:underline">
                                                Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
