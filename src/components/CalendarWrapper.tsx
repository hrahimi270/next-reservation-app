"use client";

import { api } from "@/trpc/react";
import { Resevation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import Calendar from "react-calendar";

interface CalendarWrapperProps {
  monthReservations?: Resevation[];
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

export default function CalendarWrapper(props: CalendarWrapperProps) {
  const router = useRouter();
  const [value, onChange] = useState(new Date());
  const [reservationDates, setReservationDates] = useState<Date[]>();
  const [startReservationHour, setStartReservationHour] = useState<string>();
  const [endReservationHour, setEndReservationHour] = useState<string>();

  const { mutate } = api.reservation.create.useMutation();

  useEffect(() => {
    if (value) {
      // setting the start to the selected day, 9 am
      const startReservationTime = new Date(value);
      startReservationTime.setHours(9, 0, 0, 0);
      console.log(value.getDay());

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

      setReservationDates(reservationDates);
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

    mutate({
      reservedFrom,
      reservedTo,
    }, {
      onSuccess: () => {
        router.refresh();
      }
    });
  }

  function getReservationsForDay(date: Date) {
    return props.monthReservations?.filter(
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
          date.getDay() === 6 ||
          date.getDay() === 0
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

      <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
        <select
          name="from"
          onChange={(event) => setStartReservationHour(event.target.value)}
          value={startReservationHour}
        >
          <option>select the from time</option>
          {reservationDates?.map((date) => {
            const hour = date.toTimeString().slice(0, 5);

            if (hour === "00:00") {
              return (
                <>
                  <option key={date.toISOString()} value={date.toISOString()}>
                    {hour}
                  </option>
                  <option key="tomorrow" disabled>
                    --- tomorrow ---
                  </option>
                </>
              );
            }

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
                const hour = date.toTimeString().slice(0, 5);

                if (hour === "00:00") {
                  return (
                    <>
                      <option
                        key={date.toISOString()}
                        value={date.toISOString()}
                      >
                        {hour}
                      </option>
                      <option key="tomorrow" disabled>
                        --- tomorrow ---
                      </option>
                    </>
                  );
                }

                return (
                  <option key={date.toISOString()} value={date.toISOString()}>
                    {hour}
                  </option>
                );
              })
          )}
        </select>

        <button type="submit">submit</button>
      </form>
    </Fragment>
  );
}
