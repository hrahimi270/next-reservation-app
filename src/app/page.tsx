import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import CalendarWrapper from "@/components/CalendarWrapper";
import Reservations from "@/components/Reservations";
import ReservationForm from "@/components/ReservationForm";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const session = await getServerAuthSession();

  // fallback to empty state of url params
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // getting the year and month from the URL as a persitent state
  const yearFromURL = Number(searchParams.year) || currentYear;
  const monthFromURL = Number(searchParams.month) || currentMonth;

  const monthReservations = session?.user
    ? await api.reservation.getMonthReservations.query({
        year: yearFromURL,
        month: monthFromURL,
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col items-center px-8 sm:px-0 sm:flex-row">
        {/* Using <Suspense>, we are streaming our client components */}
        <Suspense>
          <CalendarWrapper monthReservations={monthReservations} />
          <Reservations monthReservations={monthReservations} />
        </Suspense>
      </div>

      {/* Using <Suspense>, we are streaming our client components */}
      <Suspense>
        <ReservationForm
          user={session?.user}
          monthReservations={monthReservations}
        />
      </Suspense>
    </div>
  );
}
