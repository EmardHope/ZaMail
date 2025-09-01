import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Zama FHEVM SDK Quickstart",
  description: "Zama FHEVM SDK Quickstart app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-gray-900 text-foreground antialiased`}>
        <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
