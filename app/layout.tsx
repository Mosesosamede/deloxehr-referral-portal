import type {Metadata} from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Deloxe HR Incentive & Referral System',
  description: 'Manage individual influencers, corporate partners, link tracking, commissions, and payouts.',
  icons: {
    icon: 'https://i.ibb.co/pjxqNW0p/favicon.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <meta name="monetag" content="22145dc86091ff800251b061867bc075" />
        <script src="https://5gvci.com/act/files/tag.min.js?z=11621141" data-cfasync="false" async></script>
      </head>
      <body suppressHydrationWarning className="bg-[#0b0f19] text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

