import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import CalendarWrapper from "@/components/CalendarWrapper";
import { api } from "@/trpc/server";

export default async function Home({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const session = await getServerAuthSession();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const monthReservations = session?.user
    ? await api.reservation.getMonthReservations.query({
        year: Number(searchParams.year) || currentYear,
        month: Number(searchParams.month) || currentMonth,
      })
    : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            <span>Logged in as {session?.user?.name}</span>
          </p>
          <Link
            href="/api/auth/signout"
            className="rounded-full bg-slate-200 px-10 py-3 font-semibold no-underline transition hover:bg-slate-400"
          >
            Sign out
          </Link>
          <CalendarWrapper user={session?.user} monthReservations={monthReservations} />
        </div>
      </div>
    </main>
  );
}
