import './globals.css';

export const metadata = {
  title: 'CoastList — Furniture Marketplace',
  description: 'Discover curated furniture from top brands — all in one place. Browse by room, style, or brand and find the perfect piece for your home.',
  keywords: 'furniture marketplace, home furniture, mid-century modern, scandinavian, industrial, living room, bedroom, dining room',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
