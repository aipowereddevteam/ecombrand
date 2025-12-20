import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import ClientProvider from "@/components/ClientProvider";

export const metadata = {
    title: "ShopMate",
    description: "Best Online Shopping Site",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="flex flex-col min-h-screen bg-background text-foreground" suppressHydrationWarning>
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
