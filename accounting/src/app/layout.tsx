import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import "./styles/globals.css";

const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Accounting Web Application</title>
        <meta name="description" content="A website that takes simplicity into account" />
        <link rel="stylesheet" href="src/app/globals.css" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
