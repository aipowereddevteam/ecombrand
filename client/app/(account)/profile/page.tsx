'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Edit2, Check, X, Shield } from 'lucide-react';

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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if ((formData as any)[key]) data.append(key, (formData as any)[key]);
            });
            if (selectedFile) {
                data.append('avatar', selectedFile);
            }

            const response = await axios.put(`${apiUrl}/user/profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUser(response.data.user);
            setIsEditing(false);
            alert("Profile Updated Successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    const handleCancel = () => {
        setFormData(user || {});
        setSelectedFile(null);
        setPreviewImage(null);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center text-gray-400">Loading details...</div>;
    }

    if (!user) return null;

    // Helper to get badge styling
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return { label: 'Admin Account', color: 'text-purple-600 bg-purple-50' };
            case 'warehouse': return { label: 'Warehouse Staff', color: 'text-orange-600 bg-orange-50' };
            case 'accountant': return { label: 'Accountant', color: 'text-green-600 bg-green-50' };
            case 'account_manager': return { label: 'Account Manager', color: 'text-blue-600 bg-blue-50' };
            default: return null;
        }
    };

    const roleInfo = getRoleBadge(user.role);

    return (
        <div>
            <div className="mb-8 border-b pb-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                        <img
                            src={previewImage || user.avatar || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-pink-600 transition-colors shadow-sm">
                            <Edit2 size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h1>

                    {roleInfo && (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${roleInfo.color} px-2 py-0.5 rounded-md w-fit mb-4 mx-auto md:mx-0`}>
                            <Shield size={12} fill="currentColor" />
                            <span>{roleInfo.label}</span>
                        </div>
                    )}

                    {/* Header Text or just edit button? User asked to remove 'Profile Details' text. */}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-pink-500 hover:text-pink-600 uppercase border border-pink-500 px-6 py-2 rounded-sm transition-colors">
                            Edit Profile
                        </button>
                    ) : (
                        <span className="text-sm text-gray-400 italic">Update your photo and details below</span>
                    )}
                </div>
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
