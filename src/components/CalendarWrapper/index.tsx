"use client";

import { MonthReservation, generateCalendarTileShader } from "@/lib";
import { parseAsIsoDateTime, useQueryState } from "next-usequerystate";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Calendar, { TileArgs } from "react-calendar";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

interface CalendarWrapperProps {
  monthReservations?: MonthReservation[];
}

// !bg-green-100/50
// !bg-green-200/50
// !bg-green-300/50
// !bg-green-400/50
// !bg-green-500/50
// !bg-green-600/50
// !bg-green-700/50
// !bg-green-800/50
// !bg-green-900/50

export default function CalendarWrapper({
  monthReservations,
}: CalendarWrapperProps) {
  const router = useRouter();

  // setting the active start date based on the url
  const search = useSearchParams();
  const startDateYear = search.get("year");
  const startDateMonth = search.get("month");
  const activeStartDate =
    startDateYear && startDateMonth
      ? new Date(Number(startDateYear), Number(startDateMonth) - 1, 1)
      : new Date();

  const [, setSelectedDate] = useQueryState(
    "selectedDate",
    parseAsIsoDateTime.withDefault(new Date()),
  );

  const [value, onChange] = useState(new Date());

  function getReservationsForDay(date: Date) {
    return monthReservations?.filter(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === date.getDate(),
    );
  }

  function getTileClassNames({ date }: TileArgs) {
    const reservations = getReservationsForDay(date);
    const classNames = generateCalendarTileShader(reservations?.length);

    return [...classNames];
  }

  function onActiveStartDateChange(activeStartDate: Date | null) {
    if (activeStartDate) {
      router.push(
        `/?year=${activeStartDate.getFullYear()}&month=${
          activeStartDate.getMonth() + 1
        }`,
      );
    }
  }

  return (
    <Calendar
      onChange={async (value) => {
        onChange(value as Date);
        await setSelectedDate(value as Date); // setting the date state to URL params
      }}
      value={value}
      activeStartDate={activeStartDate}
      onActiveStartDateChange={({ activeStartDate }) =>
        onActiveStartDateChange(activeStartDate)
      }
      minDate={new Date()}
      nextLabel={<FiChevronRight />}
      prevLabel={<FiChevronLeft />}
      next2Label={null}
      prev2Label={null}
      // disable weekends
      tileDisabled={({ date }) => date.getDay() === 6 || date.getDay() === 0}
      // green shade based on the number of reservations
      tileClassName={getTileClassNames}
      // show the number of reservations on hover
      tileContent={({ date }) => {
        const reservations = getReservationsForDay(date);

        return reservations?.length ? (
          <span className="min-w-5 min-h-5 bg-green absolute left-0 top-1 rounded-full bg-red-400 px-1 text-slate-700 opacity-0 group-hover:opacity-100">
            {reservations.length}
          </span>
        ) : null;
      }}
    />
  );
}
