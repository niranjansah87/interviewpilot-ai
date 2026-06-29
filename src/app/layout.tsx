import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'InterviewPilot AI',
    template: '%s | InterviewPilot AI',
  },
  description:
    'AI-powered voice interview platform that simulates realistic technical and behavioral interviews through dynamic conversations.',
  keywords: [
    'interview',
    'AI',
    'mock interview',
    'voice interview',
    'practice interview',
    'interview preparation',
  ],
  authors: [{ name: 'Niranjan Sah' }],
  creator: 'Niranjan Sah',
  openGraph: {
    type: 'website',
    siteName: 'InterviewPilot AI',
    title: 'InterviewPilot AI',
    description:
      'AI-powered voice interview platform that simulates realistic interviews.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewPilot AI',
    description: 'AI-powered voice interview platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
