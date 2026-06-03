import type { Metadata } from 'next';
import './globals.css';

// Application root layout and metadata.
// Font is handled via a system font stack in globals.css — no network fetch
// needed at build time, which makes the Vercel deployment reliable.

export const metadata: Metadata = {
  title: 'TaskOS',
  description: 'Futuristic task dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}