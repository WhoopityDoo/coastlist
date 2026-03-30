import './globals.css';

export const metadata = {
  title: 'CoastList — Coastal Living, Curated',
  description: 'Handpicked coastal furniture and decor for your life by the water. Browse curated collections from top retailers.',
  keywords: 'coastal furniture, beach house decor, coastal living, Hamptons style, modern coastal, outdoor furniture',
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
