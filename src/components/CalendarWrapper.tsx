"use client";

import { api } from "@/trpc/react";
import {
  Resevation as PrismaResevation,
  User as PrismaUser,
} from "@prisma/client";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";

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
        // if the selected day is not friday, set the end date to tomorrow 11 am
        endReservationTime.setDate(value.getDate() + 1);
        endReservationTime.setHours(11, 0, 0, 0);
      } else {
        // unless the selected day is friday, set the end to 5 pm
        endReservationTime.setHours(17, 0, 0, 0);
      }

      // list of available reservation dates (hours) for the selected date to multiplication of 1 hour
      const reservationDates = [];
      while (startReservationTime <= endReservationTime) {
        reservationDates.push(new Date(startReservationTime));
        startReservationTime.setHours(startReservationTime.getHours() + 1);
      }

      // filter available hours by already reserved hours
      const selectedDateReservations = monthReservations?.filter(
        (reservation) =>
          new Date(reservation.reservedFrom).getDate() === value.getDate(),
      );
      const reservableDates = reservationDates.filter((availableDate) => {
        const isAvailable = selectedDateReservations?.every(
          (reservation) =>
            new Date(reservation.reservedFrom).getTime() !==
              availableDate.getTime() &&
            new Date(reservation.reservedTo).getTime() !==
              availableDate.getTime(),
        );

        return isAvailable;
      });

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

  return (
    <Fragment>
      <Calendar
        onChange={(value) => onChange(value as Date)}
        value={value}
        minDate={new Date()}
        tileDisabled={({ date }) =>
          // disable weekends
          date.getDay() === 6 || date.getDay() === 0
        }
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
        <p className="my-5 text-red-500">You already reserved on this day!</p>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
        <select
          name="from"
          onChange={(event) => setStartReservationHour(event.target.value)}
          value={startReservationHour}
          disabled={userAlreadyReservedForSelectedDate}
        >
          <option>select the from time</option>
          {reservationDates?.map((date) => {
            const isDateTomorrow = date.getDate() !== value.getDate();
            const hour = date.toTimeString().slice(0, 5);

            return (
              <option key={date.toISOString()} value={date.toISOString()}>
                {isDateTomorrow ? "tomorrow " : null}
                {hour}
              </option>
            );
          })}
        </select>

        <select
          name="to"
          onChange={(event) => setEndReservationHour(event.target.value)}
          value={endReservationHour}
          disabled={userAlreadyReservedForSelectedDate}
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

        <button type="submit" disabled={userAlreadyReservedForSelectedDate}>
          submit
        </button>
      </form>
    </Fragment>
  );
}
