import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

import { TRPCReactProvider } from "@/trpc/react";
import { getServerAuthSession } from "@/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Pragmateam Reservation App",
  description: "Created by Next.js and T3",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if(!session?.user) {
    redirect('/api/auth/signin')
  }
  
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} bg-blue-50`}>
        <TRPCReactProvider cookies={cookies().toString()}>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
