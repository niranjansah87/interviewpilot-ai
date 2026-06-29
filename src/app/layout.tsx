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
  authors: [{ name: 'Niranjan Sah' }],
  creator: 'Niranjan Sah',
  openGraph: {
    type: 'website',
    siteName: 'InterviewPilot AI',
    title: 'InterviewPilot AI',
    description: 'AI-powered voice interview platform that simulates realistic interviews.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(224 71% 48%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(224 71% 45%)' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
