"use client";

import { User } from "next-auth";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";

import { useEffect, useMemo, useState } from "react";
import { parseAsIsoDateTime, useQueryState } from "next-usequerystate";
import {
  MonthReservation,
  filterAvailableReservationHours,
  generateAvailableHours,
  getMonthReservationsForDate,
  getStartAndEndOfReservationForDate,
  hasAnyEmptySpotLeftForDate,
  userHasAlreadyReservedForDate,
} from "@/lib";
import AlreadyReservedMessage from "../AlreadyReservedMessage";
import NoMoreSpotsMessage from "../NoMoreSpotsMessage";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface ReservationFormProps {
  monthReservations?: MonthReservation[];
  user?: User;
}

export default function ReservationForm({
  monthReservations,
  user,
}: ReservationFormProps) {
  // get selected date by user from the URL
  const [selectedDate] = useQueryState(
    "selectedDate",
    parseAsIsoDateTime.withDefault(new Date()),
  );

  const [availableReservations, setAvailableReservations] = useState<Date[]>();
  const [startReservationHour, setStartReservationHour] = useState<string>();

  const router = useRouter();
  const { mutate } = api.reservation.create.useMutation();

  // check if user has already reserved for the selected date
  const isUserAlreadyReservedForDate = useMemo(() => {
    return userHasAlreadyReservedForDate({
      monthReservations,
      user,
      date: selectedDate,
    });
  }, [monthReservations, user, selectedDate]);

  // check if there is any empty spots left for the selected date
  const noEmptySpotsLeft = useMemo(() => {
    return hasAnyEmptySpotLeftForDate(availableReservations, selectedDate);
  }, [availableReservations, selectedDate]);

  // is the reservation form disabled?
  const isFormDisabled = isUserAlreadyReservedForDate ?? noEmptySpotsLeft;

  // calculate available reservation dates for the selected date
  useEffect(() => {
    if (selectedDate) {
      // get the start and end of the reservation for the selected date
      const { startReservationTime, endReservationTime } =
        getStartAndEndOfReservationForDate(selectedDate);

      // list of available reservation dates (hours) for the selected date to multiplication of 1 hour
      const availableReservationDates = generateAvailableHours(
        startReservationTime,
        endReservationTime,
      );

      // get all reservations for the selected date
      const reservationsForDate = getMonthReservationsForDate(
        monthReservations,
        selectedDate,
      );

      // filter available reservation hours for the selected date
      const reservableDates = filterAvailableReservationHours(
        availableReservationDates,
        reservationsForDate,
      );

      setAvailableReservations(reservableDates);
    }
  }, [selectedDate]);

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

  return (
    <form
      onSubmit={handleFormSubmit}
      className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-md bg-white p-6 sm:grid-cols-6"
    >
      {/* Let user know they cannot reserve for this date */}
      <AlreadyReservedMessage show={isUserAlreadyReservedForDate} />

      {/* Let user know there are not more spots left for this date */}
      <NoMoreSpotsMessage
        show={!isUserAlreadyReservedForDate && noEmptySpotsLeft}
      />

      {user?.name ? (
        <div className="sm:col-span-1">
          <div className="mt-2">
            <Input name="name" defaultValue={user.name} disabled />
          </div>
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select
            name="from"
            onChange={(event) => setStartReservationHour(event.target.value)}
            value={startReservationHour}
            disabled={isFormDisabled}
          >
            <option>When do you want to reserve?</option>
            {availableReservations?.map((date) => {
              const isDateTomorrow = date.getDate() !== selectedDate.getDate();
              const hour = date.toTimeString().slice(0, 5);

              if (isDateTomorrow) return null;

              return (
                <option key={date.toISOString()} value={date.toISOString()}>
                  {hour}
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="to" disabled={isFormDisabled}>
            {!startReservationHour ? (
              <option>Select the start time first</option>
            ) : (
              // filter the reservation dates to be after the selected start time
              availableReservations
                ?.filter(
                  (date) =>
                    date.getTime() > new Date(startReservationHour).getTime(),
                )
                .map((date) => {
                  const isDateTomorrow =
                    date.getDate() !== selectedDate.getDate();
                  const hour = date.toTimeString().slice(0, 5);

                  return (
                    <option key={date.toISOString()} value={date.toISOString()}>
                      {isDateTomorrow ? "tomorrow " : null}
                      {hour}
                    </option>
                  );
                })
            )}
          </Select>
        </div>
      </div>

      <div className="sm:col-span-1">
        <div className="mt-2">
          <Button type="submit" disabled={isFormDisabled}>
            Reserve
          </Button>
        </div>
      </div>
    </form>
  );
}
