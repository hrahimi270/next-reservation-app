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
  const monthReservations = session?.user
    ? await api.reservation.getMonthReservations.query({
        year: Number(searchParams.year) || currentYear,
        month: Number(searchParams.month) || currentMonth,
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex">
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
