'use client';
import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { removeItemsFromCart, addToCart, ICartItem } from '@/redux/slices/cartSlice';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { RootState } from '@/redux/store';

interface DecodedToken {
    isPhoneVerified?: boolean;
    [key: string]: any;
}

export default function CartPage() {
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const [error, setError] = React.useState<string | null>(null);

    // clear error when cart changes
    React.useEffect(() => {
        setError(null);
    }, [cartItems]);

    if (!isMounted) {
        return <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground">Loading...</div>;
    }

    const increaseQuantity = (item: ICartItem) => {
        const newQty = item.quantity + 1;
        // Limit logic can be added here if we check stock available
        dispatch(addToCart({ ...item, quantity: newQty }));
    };

    const decreaseQuantity = (item: ICartItem) => {
        const newQty = item.quantity - 1;
        if (newQty <= 0) return;
        dispatch(addToCart({ ...item, quantity: newQty }));
    };

    const removeFromCartHandler = (item: ICartItem) => {
        dispatch(removeItemsFromCart({ product: item.product, size: item.size }));
    };

    const checkoutHandler = async () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login?redirect=shipping');
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (!decoded.isPhoneVerified) {
                router.push('/verify-phone');
                return;
            }

            // Validate Cart Items (Check Stock & Active Status)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';
            for (const item of cartItems) {
                try {
                    // Route: /api/products/:id/check-stock
                    const res = await fetch(`${apiUrl}/products/${item.product}/check-stock?size=${item.size}`);
                    const data = await res.json();
                    
                    if (!res.ok) {
                        setError(`Item "${item.name}" is unavailable: ${data.error || 'Out of Stock'}`);
                        return; // Stop Checkout
                    }
                } catch (err) {
                    console.error("Stock check failed", err);
                    setError("Could not verify stock. Please try again.");
                    return;
                }
            }

        } catch (error) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        router.push('/shipping');
    };

    // Calculate Totals
    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * 0.18; // Example 18% GST
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const total = subtotal + tax + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="text-muted-foreground" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/30 transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}
            <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart ({cartItems.length} items)</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={`${item.product}_${item.size}`} className="bg-card p-4 rounded-xl shadow-sm border border-border flex gap-4 items-center">
                            <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden p-2">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Link href={`/product/${item.product}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate block">
                                    {item.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                <p className="text-lg font-bold text-foreground mt-1">₹{item.price}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                                    <button onClick={() => decreaseQuantity(item)} className="p-1 hover:bg-background rounded-full text-foreground transition-colors">
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-bold text-sm min-w-[20px] text-center text-foreground">{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item)} className="p-1 hover:bg-background rounded-full text-foreground transition-colors">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCartHandler(item)}
                                    className="text-destructive text-sm hover:underline flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="w-full lg:w-[380px] h-fit">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border sticky top-24">
                        <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

                        <div className="space-y-4 text-sm mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax (18% GST)</span>
                                <span className="font-semibold">₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="border-t border-border pt-4 flex justify-between text-lg font-bold text-foreground">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={checkoutHandler}
                            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout <ArrowRight size={18} />
                        </button>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Safe and secure payments using Razorpay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
