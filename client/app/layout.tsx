import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Reserve Beta',
    description: 'Discover and book tables at the finest restaurants.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang="en" suppressHydrationWarning>
                <head />
                <body>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Footer />
                        <Toaster />
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}
