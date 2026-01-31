"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from '../../lib/firebaseConfig';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}

export default function VerifyPhonePage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
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
        } catch (error: any) {
            console.error("Error sending OTP", error);
            setMessage('Error sending OTP: ' + error.message);
        }
    };

    useEffect(() => {
        // Cleanup ReCAPTCHA on unmount to prevent "client element has been removed" error
        return () => {
             if (window.recaptchaVerifier) {
                 window.recaptchaVerifier.clear();
                 // @ts-ignore
                 window.recaptchaVerifier = null;
             }
        };
    }, []);

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

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api/v1'}/auth/verify-phone`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phone: phoneNumber })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                // If text is "Unauthorized", handle it gracefully
                data = { error: text || 'Request failed' };
            }

            if (res.ok) {
                // Update token with new one containing verified status
                localStorage.setItem('token', data.token);
                setMessage('Phone verified! Redirecting...');
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                if (res.status === 401) {
                    setMessage('Session expired or unauthorized. Please login again.');
                } else {
                    setMessage(data.error || 'Verification failed on server.');
                }
            }
        } catch (error: any) {
            console.error("Error verifying OTP", error);
            setMessage(error.message || 'Invalid OTP code.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
            <div className="z-10 w-full max-w-md p-8 bg-card rounded-lg shadow-md border border-border">
                <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Verify Phone</h1>

                {message && (
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-md text-sm">
                        {message}
                    </div>
                )}

                <div id="recaptcha-container"></div>

                {!verificationId ? (
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                        />
                        <button
                            onClick={onSendOTP}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Send OTP
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <label className="block text-sm font-medium text-foreground">OTP Code</label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
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
