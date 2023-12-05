import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import ContextProvider from "./helpers/ContextProvider";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Accounting Web Application</title>
        <meta
          name="description"
          content="A website that takes simplicity into account"
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
