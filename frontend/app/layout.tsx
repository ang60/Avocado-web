import { DM_Serif_Display, IBM_Plex_Sans } from 'next/font/google';
import { Providers } from './providers';
import '../src/styles/fonts.css';
import '../src/styles/theme.css';
import "leaflet/dist/leaflet.css";

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const ibmPlex = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata = {
  title: 'AvoGuard - Avocado Pest & Disease Monitoring',
  description: 'Modern pest and disease monitoring system for Kenyan avocado farmers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${ibmPlex.variable}`}>
      <body style={{ backgroundColor: '#F7F4EF', margin: 0, padding: 0 }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
