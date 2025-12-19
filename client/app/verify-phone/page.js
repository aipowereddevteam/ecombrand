"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../../lib/firebaseConfig';

export default function VerifyPhonePage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [message, setMessage] = useState('');

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    };

    const onSendOTP = async () => {
        setMessage('');
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setVerificationId(confirmationResult.verificationId);
            setMessage('OTP set successfully!');
        } catch (error) {
            console.error("Error sending OTP", error);
            setMessage('Error sending OTP: ' + error.message);
        }
    };

    const onVerifyOTP = async () => {
        setMessage('');
        try {
            const credential = await window.confirmationResult.confirm(verificationCode);
            // User signed in with Firebase. Now update backend.

            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('No user token found. Please login again.');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-phone`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phone: phoneNumber })
            });

            const data = await res.json();

            if (res.ok) {
                // Update token with new one containing verified status
                localStorage.setItem('token', data.token);
                setMessage('Phone verified! Redirecting...');
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                setMessage(data.error || 'Verification failed on server.');
            }

        } catch (error) {
            console.error("Error verifying OTP", error);
            setMessage('Invalid OTP code.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
            <div className="z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Verify Phone</h1>

                {message && (
                    <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
                        {message}
                    </div>
                )}

                <div id="recaptcha-container"></div>

                {!verificationId ? (
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        />
                        <button
                            onClick={onSendOTP}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Send OTP
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        />
                        <button
                            onClick={onVerifyOTP}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Verify OTP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
