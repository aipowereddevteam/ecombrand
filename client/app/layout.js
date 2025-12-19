import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
    title: "ShopMate",
    description: "Best Online Shopping Site",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen bg-gray-100">
                <Header />
                <main className="flex-grow w-full">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
