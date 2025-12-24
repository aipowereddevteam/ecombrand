'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Edit2, Check, X } from 'lucide-react';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    location?: string;
    alternateMobile?: string;
    hintName?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const { data } = await axios.get(`${apiUrl}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(data.user);
                setFormData(data.user);
            } catch (error: any) {
                console.error("Failed to fetch profile", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('token');
                    router.push('/login');
                } else {
                    alert("Failed to load profile data. Please ensure server is running.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            
            const { data } = await axios.put(`${apiUrl}/user/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(data.user);
            setIsEditing(false);
            alert("Profile Updated Successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    const handleCancel = () => {
        setFormData(user || {});
        setIsEditing(false);
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center text-gray-400">Loading details...</div>;
    }

    if (!user) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-pink-500 hover:text-pink-600 uppercase">
                            Edit Details
                        </button>
                    )}
            </div>

            <div className="space-y-6 max-w-2xl">
                
                {/* Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Full Name</label>
                    {isEditing ? (
                        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.name}</div>
                    )}
                </div>

                {/* Mobile Number */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Mobile Number</label>
                    {isEditing ? (
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.phone || '- not added -'}</div>
                    )}
                </div>

                {/* Email ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Email ID</label>
                    {isEditing ? (
                        <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.email}</div>
                    )}
                </div>

                {/* Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Gender</label>
                    {isEditing ? (
                        <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded">
                            <option value="">Select</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.gender || '- not added -'}</div>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Date of Birth</label>
                    {isEditing ? (
                        <input type="date" name="dob" value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.dob ? new Date(user.dob).toLocaleDateString() : '- not added -'}</div>
                    )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Location</label>
                    {isEditing ? (
                        <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.location || '- not added -'}</div>
                    )}
                </div>

                {/* Alternate Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Alternate Mobile</label>
                    {isEditing ? (
                        <input type="text" name="alternateMobile" value={formData.alternateMobile || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.alternateMobile || '- not added -'}</div>
                    )}
                </div>

                    {/* Hint Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="text-sm text-gray-500 font-medium">Hint Name</label>
                    {isEditing ? (
                        <input type="text" name="hintName" value={formData.hintName || ''} onChange={handleInputChange} className="md:col-span-2 border p-2 rounded" />
                    ) : (
                        <div className="md:col-span-2 text-gray-900 font-medium">{user.hintName || '- not added -'}</div>
                    )}
                </div>

                <div className="pt-8">
                    {isEditing ? (
                        <div className="flex gap-4">
                            <button onClick={handleSave} className="flex-1 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-sm uppercase tracking-wider transition-colors">
                                Save Details
                            </button>
                            <button onClick={handleCancel} className="px-8 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-sm uppercase tracking-wider transition-colors">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-12 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-sm uppercase tracking-wider transition-colors">
                            Edit
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
