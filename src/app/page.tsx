import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import CalendarWrapper from "@/components/CalendarWrapper";
import Reservations from "@/components/Reservations";
import ReservationForm from "@/components/ReservationForm";

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
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="flex mb-4">
        <CalendarWrapper
          user={session?.user}
          monthReservations={monthReservations}
        />

        <Reservations monthReservations={monthReservations} />
      </div>

      <ReservationForm user={session?.user} monthReservations={monthReservations} />
    </div>
  );
}
