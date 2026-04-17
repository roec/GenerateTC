import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Case Agentic AI Platform',
  description: 'Enterprise platform for agentic AI test case generation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
