"use client";

import { api } from "@/trpc/react";
import {
  Resevation as PrismaResevation,
  User as PrismaUser,
} from "@prisma/client";
import { User } from "next-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

interface Reservation extends PrismaResevation {
  createdBy: PrismaUser;
}

interface CalendarWrapperProps {
  monthReservations?: Reservation[];
  user?: User;
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
  user,
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

  const [value, onChange] = useState(new Date());
  const [reservationDates, setReservationDates] = useState<Date[]>();
  const [startReservationHour, setStartReservationHour] = useState<string>();
  const [endReservationHour, setEndReservationHour] = useState<string>();

  const { mutate } = api.reservation.create.useMutation();

  // disable reservation if the user already reserved once for the selected date
  const userAlreadyReservedForSelectedDate = useMemo(() => {
    const userReservations = monthReservations?.filter(
      (reservation) => reservation.createdById === user?.id,
    );

    return userReservations?.some(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === value.getDate(),
    );
  }, [monthReservations, user, value]);

  // disable reservation if there is no empty spots
  const noEmptySpotsLeft = useMemo(() => {
    const selectedDateAvailableSpots = reservationDates?.filter(
      (reservation) => {
        return reservation.getDate() === value.getDate();
      },
    );

    return !selectedDateAvailableSpots?.length;
  }, [reservationDates, value]);

  const isFormDisabled = userAlreadyReservedForSelectedDate ?? noEmptySpotsLeft;

  // list of reservations for the selected date
  const selectedDateReservations = useMemo(() => {
    return monthReservations?.filter(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === value.getDate(),
    );
  }, [monthReservations, value]);

  useEffect(() => {
    if (value) {
      // setting the start to the selected day, 9 am
      const startReservationTime = new Date(value);
      startReservationTime.setHours(9, 0, 0, 0);

      // setting the end date
      const endReservationTime = new Date(value);
      if (value.getDay() !== 5) {
        // if the selected day is not friday, set the end date to tomorrow 10 am
        endReservationTime.setDate(value.getDate() + 1);
        endReservationTime.setHours(10, 0, 0, 0); // giving 1 hour for the last reservation
      } else {
        // unless the selected day is friday, set the end to 4 pm
        endReservationTime.setHours(16, 0, 0, 0); // giving 1 hour for the last reservation
      }

      // list of available reservation dates (hours) for the selected date to multiplication of 1 hour
      const availableReservationDates: Date[] = [];
      while (startReservationTime <= endReservationTime) {
        availableReservationDates.push(new Date(startReservationTime));
        startReservationTime.setHours(startReservationTime.getHours() + 1);
      }

      // filter available hours by already reserved hours
      const selectedDateReservations = monthReservations?.filter(
        (reservation) =>
          new Date(reservation.reservedFrom).getDate() === value.getDate(),
      );
      const reservableDates = availableReservationDates.filter(
        (availableDate) => {
          const availableDateTime = availableDate.getTime();
          const availableDateClone = new Date(availableDateTime);
          availableDateClone.setHours(availableDateClone.getHours() + 1);
          const availableDateTimePlusOneHour = availableDateClone.getTime();

          const isDateReserved = selectedDateReservations?.filter(
            (reservation) => {
              const reservationFrom = reservation.reservedFrom.getTime();
              const reservationTo = reservation.reservedTo.getTime();

              return (
                (availableDateTime >= reservationFrom &&
                  availableDateTime <= reservationTo) ||
                (availableDateTimePlusOneHour >= reservationFrom &&
                  availableDateTimePlusOneHour <= reservationTo)
              );
            },
          );

          return !isDateReserved?.length;
        },
      );

      setReservationDates(reservableDates);
    }
  }, [value]);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const {
      from: { value: reservedFrom },
      to: { value: reservedTo },
    } = event.target as unknown as {
      from: { value: string };
      to: { value: string };
    };

    mutate(
      {
        reservedFrom,
        reservedTo,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  }

  function getReservationsForDay(date: Date) {
    return monthReservations?.filter(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === date.getDate(),
    );
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
    <Fragment>
      <Calendar
        onChange={(value) => onChange(value as Date)}
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
        tileClassName={({ date }) => {
          const reservations = getReservationsForDay(date);
          const shade =
            reservations?.length && reservations?.length <= 9
              ? `!bg-green-${reservations.length * 100}/50`
              : reservations?.length && reservations?.length > 9
                ? "!bg-green-900/75"
                : "!bg-white";

          return ["group relative !text-slate-900", shade];
        }}
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

      {selectedDateReservations?.length ? (
        <div className="my-5 flex flex-col gap-5">
          {selectedDateReservations.map((reservation) => {
            return (
              <div
                key={reservation.id}
                className="rounded-md border border-gray-200 p-5"
              >
                <span>{reservation.createdBy.name}</span> {" - "}
                <span>
                  {new Date(reservation.reservedFrom).toLocaleTimeString()}
                </span>
                {" to "}
                <span>
                  {new Date(reservation.reservedTo).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {userAlreadyReservedForSelectedDate ? (
        <p className="mb-1 mt-3 text-red-500">
          You already reserved on this day!
        </p>
      ) : null}

      {!userAlreadyReservedForSelectedDate && noEmptySpotsLeft ? (
        <p className="mb-1 mt-3 text-red-500">
          There are no empty spost for the selected day!
        </p>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
        <select
          name="from"
          onChange={(event) => setStartReservationHour(event.target.value)}
          value={startReservationHour}
          disabled={isFormDisabled}
        >
          <option>select the from time</option>
          {reservationDates?.map((date) => {
            const isDateTomorrow = date.getDate() !== value.getDate();
            const hour = date.toTimeString().slice(0, 5);

            if (isDateTomorrow) return null;

            return (
              <option key={date.toISOString()} value={date.toISOString()}>
                {hour}
              </option>
            );
          })}
        </select>

        <select
          name="to"
          onChange={(event) => setEndReservationHour(event.target.value)}
          value={endReservationHour}
          disabled={isFormDisabled}
        >
          {!startReservationHour ? (
            <option>select the from time first</option>
          ) : (
            // filter the reservation dates to be after the selected start time
            reservationDates
              ?.filter(
                (date) =>
                  date.getTime() > new Date(startReservationHour).getTime(),
              )
              .map((date) => {
                const isDateTomorrow = date.getDate() !== value.getDate();
                const hour = date.toTimeString().slice(0, 5);

                return (
                  <option key={date.toISOString()} value={date.toISOString()}>
                    {isDateTomorrow ? "tomorrow " : null}
                    {hour}
                  </option>
                );
              })
          )}
        </select>

        <button type="submit" disabled={isFormDisabled}>
          submit
        </button>
      </form>
    </Fragment>
  );
}
