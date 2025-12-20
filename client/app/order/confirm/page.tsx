'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { clearCart } from '@/redux/slices/cartSlice';
import { RootState } from '@/redux/store';

// Extend Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export default function ConfirmOrder() {
    const { shippingInfo, cartItems } = useSelector((state: RootState) => state.cart);
    const router = useRouter();
    const dispatch = useDispatch();
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const proceedToPayment = async () => {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        try {
            // 0. Pre-Flight Stock Check (Frontend)
            for (const item of cartItems) {
                try {
                    await axios.get(`${apiUrl}/products/${item.product}/check-stock?size=${item.size}`);
                } catch (error: any) {
                    if (error.response && error.response.status === 409) {
                        alert(`Sorry, ${item.name} (Size: ${item.size}) is out of stock! Please remove it from cart.`);
                        setIsProcessing(false);
                        return;
                    }
                    // Ignore other errors for now to allow proceeding if check fails (optimistic) or handle strictly
                }
            }

            // 1. Create Order on Server (Razorpay)
            const { data: { key, order } } = await axios.post(
                `${apiUrl}/payment/process`,
                { amount: Math.round(total * 100) }, // in paise
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Open Razorpay Modal
            const options = {
                key, // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: "INR",
                name: "ShopMate",
                description: "Purchase of goods",
                order_id: order.id,
                handler: async function (response: RazorpayResponse) {
                    // 3. Verify Payment
                    try {
                        await axios.post(
                            `${apiUrl}/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // 4. Create Order in DB
                        const orderData = {
                            shippingInfo,
                            orderItems: cartItems,
                            itemsPrice: subtotal,
                            taxPrice: tax,
                            shippingPrice: shipping,
                            totalPrice: total,
                            paymentInfo: {
                                id: response.razorpay_payment_id,
                                status: "succeeded"
                            }
                        };

                        await axios.post(
                            `${apiUrl}/orders/new`,
                            orderData,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // 5. Clear Cart & Redirect
                        dispatch(clearCart());
                        router.push('/order/success');

                    } catch (error: any) {
                        console.error(error);
                         if (error.response && error.response.status === 409) {
                            alert("Order Failed: One or more items went out of stock during payment. Please contact support with your Payment ID: " + response.razorpay_payment_id);
                        } else {
                            alert("Payment Verification or Order Creation Failed. Please contact support.");
                        }
                    }
                },
                theme: {
                    color: "#2563EB"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment Init Failed", error);
            alert("Could not initiate payment");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    if (!mounted) return null;

    if (cartItems.length === 0) return <div>Cart Empty</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order Info */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-xl font-bold mb-4 text-foreground">Shipping Info</h2>
                    <div className="text-muted-foreground">
                        <p>{shippingInfo.address},</p>
                        <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pinCode}</p>
                        <p>{shippingInfo.country}</p>
                        <p className="mt-2 text-foreground font-medium">Phone: {shippingInfo.phoneNo}</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-xl font-bold mb-4 text-foreground">Cart Items</h2>
                    {cartItems.map((item) => (
                        <div key={`${item.product}_${item.size}`} className="flex justify-between items-center border-b border-border last:border-0 py-3">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain mix-blend-multiply dark:mix-blend-normal bg-muted rounded-md p-1" />
                                <div>
                                    <p className="font-semibold text-foreground">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Size: {item.size} x {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-bold text-foreground">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Summary */}
            <div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border sticky top-24">
                    <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                        <div className="border-t border-border pt-3 flex justify-between font-bold text-lg text-foreground"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                    </div>

                    <button
                        onClick={proceedToPayment}
                        disabled={isProcessing}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground"
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
