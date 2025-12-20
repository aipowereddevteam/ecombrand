'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground py-10 px-4">
            <div className="bg-card w-full max-w-md p-8 rounded-2xl shadow-lg border border-border text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Order Successful!</h1>
                <p className="text-muted-foreground mb-8">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>

                <div className="space-y-4">
                    <Link href="/orders" className="block w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                        View My Orders
                    </Link>
                    <Link href="/" className="block w-full bg-muted text-foreground py-3 rounded-xl font-bold hover:bg-muted/80 transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
