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

  return (
    <form className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-md bg-white p-6 sm:grid-cols-6">
      {/* Let user know they cannot reserve for this date */}
      {isUserAlreadyReservedForDate ? (
        <div className="mb-3 sm:col-span-full">
          <p className="mb-1 mt-3 text-red-500">
            You've already reserved your spot on this day!
          </p>
        </div>
      ) : null}

      {!isUserAlreadyReservedForDate && noEmptySpotsLeft ? (
        <div className="mb-3 sm:col-span-full">
          <p className="mb-1 mt-3 text-red-500">
            There are no empty spost for the selected day!
          </p>
        </div>
      ) : null}

      <div className="sm:col-span-1">
        <div className="mt-2">
          <Input name="name" placeholder="Your name" disabled />
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="from" disabled={isFormDisabled}>
            <option>hi</option>
          </Select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="to" disabled={isFormDisabled}>
            <option>hi</option>
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
