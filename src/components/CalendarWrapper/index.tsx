"use client";

import { MonthReservation, generateCalendarTileShader } from "@/lib";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import Calendar, { TileArgs, OnArgs } from "react-calendar";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import TileContent from "../TileContent";
import { useReservationStore } from "@/store/useReservationStore";

interface CalendarWrapperProps {
  monthReservations?: MonthReservation[];
}

export default function CalendarWrapper({
  monthReservations,
}: CalendarWrapperProps) {
  const router = useRouter();

  // setting the active start date based on the url
  const search = useSearchParams();
  const activeStartDate = useMemo(() => {
    const startDateYear = search.get("year");
    const startDateMonth = search.get("month");

    return startDateYear && startDateMonth
      ? new Date(Number(startDateYear), Number(startDateMonth) - 1, 1)
      : new Date();
  }, [search]);

  const selectedDate = useReservationStore((state) => state.selectedDate);
  const setSelectedDate = useReservationStore((state) => state.setSelectedDate);

  function getReservationsForDay(date: Date) {
    return monthReservations?.filter((reservation) => {
      const reservedFrom = new Date(reservation.reservedFrom).setHours(0, 0, 0);
      const calendarDate = new Date(date).setHours(0, 0, 0);
      return reservedFrom === calendarDate;
    });
  }

  function getTileClassNames({ date }: TileArgs) {
    const reservations = getReservationsForDay(date);
    const classNames = generateCalendarTileShader(reservations?.length);

    return [...classNames];
  }

  function getTileContent({ date }: TileArgs) {
    const reservations = getReservationsForDay(date);

    return reservations?.length ? (
      <TileContent reservations={reservations.length} />
    ) : null;
  }

  function onActiveStartDateChange({ activeStartDate }: OnArgs) {
    if (activeStartDate) {
      router.push(
        `/?year=${activeStartDate.getFullYear()}&month=${
          activeStartDate.getMonth() + 1
        }`,
      );
    }
  }

  useEffect(() => {
    // prefetch next month
    const nextMonthNumber =
      activeStartDate.getMonth() === 11 ? 0 : activeStartDate.getMonth() + 1;
    const nextMonth = new Date(
      activeStartDate.getFullYear(),
      nextMonthNumber,
      1,
    );
    router.prefetch(
      `/?year=${nextMonth.getFullYear()}&month=${nextMonth.getMonth() + 1}`,
    );
  }, [activeStartDate]);

  return (
    <Calendar
      onChange={async (value) => {
        setSelectedDate(value as Date);
      }}
      value={selectedDate}
      activeStartDate={activeStartDate}
      onActiveStartDateChange={onActiveStartDateChange}
      nextLabel={<FiChevronRight />}
      prevLabel={<FiChevronLeft />}
      next2Label={null}
      prev2Label={null}
      // disable weekends
      tileDisabled={({ date }) => date.getDay() === 6 || date.getDay() === 0}
      // disable pas days
      minDate={new Date()}
      // green shade based on the number of reservations
      tileClassName={getTileClassNames}
      // show the number of reservations on hover
      tileContent={getTileContent}
    />
  );
}
