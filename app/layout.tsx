import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from '@clerk/nextjs'
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Agent Builder Platform",
  description: "The app where you can build AI Agent by simply drag and drop.",
};

const outfit=Outfit({subsets:['latin']});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
       className={outfit.className}
       suppressHydrationWarning
      >
        <ConvexClientProvider>
          <Provider>
          {children}
          <Toaster/>
          </Provider>
          </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
