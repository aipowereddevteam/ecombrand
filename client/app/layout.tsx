import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientProvider from "@/components/ClientProvider";

// Configure Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
    title: "ShopMate",
    description: "Best Online Shopping Site",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} font-sans flex flex-col min-h-screen bg-background text-foreground`} suppressHydrationWarning>
                <ClientProvider>
                    <Header />
                    <main className="flex-grow w-full">
                        {children}
                    </main>
                    <Footer />
                </ClientProvider>
            </body>
        </html>
    );
}
