import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

// Application root layout and metadata. Loads a Google font and sets HTML lang.
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskOS',
  description: 'Futuristic task dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}