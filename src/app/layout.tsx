import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Echo - Community News',
  description: 'Your community-driven news aggregator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 