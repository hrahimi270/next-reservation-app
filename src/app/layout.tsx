import "@/styles/globals.css";
import "react-calendar/dist/Calendar.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { TRPCReactProvider } from "@/trpc/react";
import { getServerAuthSession } from "@/server/auth";
import Header from "@/components/Header";

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
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} bg-slate-100`}>
        <main className="min-h-full">
          <Header />
          <TRPCReactProvider cookies={cookies().toString()}>
            {children}
          </TRPCReactProvider>
        </main>
      </body>
    </html>
  );
}
