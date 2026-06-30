import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewpilot.ai';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'InterviewPilot AI — Practice Interviews with AI That Listens',
    template: '%s | InterviewPilot AI',
  },
  description:
    'AI-powered voice interview platform. Practice technical and behavioral interviews with an adaptive AI interviewer that asks real follow-up questions and provides detailed feedback.',
  keywords: [
    'AI interview practice',
    'mock interview platform',
    'technical interview preparation',
    'behavioral interview AI',
    'voice interview practice',
    'AI interview coach',
    'coding interview practice',
    'software engineer interview',
    'interview preparation platform',
    'AI career preparation',
  ],
  authors: [{ name: 'Niranjan Sah', url: 'https://github.com/niranjansah87' }],
  creator: 'Niranjan Sah',
  publisher: 'InterviewPilot AI',
  applicationName: 'InterviewPilot AI',
  category: 'Education',
  generator: 'Next.js',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    siteName: 'InterviewPilot AI',
    title: 'InterviewPilot AI — Practice Interviews with AI That Listens',
    description:
      'Practice technical and behavioral interviews with an adaptive AI interviewer. Real voice conversations, follow-up questions, and detailed feedback.',
    url: BASE_URL,
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'InterviewPilot AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@interviewpilot',
    creator: '@interviewpilot',
    title: 'InterviewPilot AI — AI-Powered Voice Interview Practice',
    description: 'Practice interviews with an AI that listens, adapts, and gives real feedback.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ url: '/favicon.ico' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'InterviewPilot AI',
              description: 'AI-powered voice interview platform that simulates realistic technical and behavioral interviews through dynamic conversations.',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              author: { '@type': 'Person', name: 'Niranjan Sah' },
            }),
          }}
        />
      </body>
    </html>
  );
}
