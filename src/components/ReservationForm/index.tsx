"use client";

import { User } from "next-auth";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";

import { useMemo } from "react";
import { parseAsIsoDateTime, useQueryState } from "next-usequerystate";
import { MonthReservation, userHasAlreadyReservedForDate } from "@/lib";

interface ReservationFormProps {
  monthReservations?: MonthReservation[];
  user?: User;
}

export default function ReservationForm({
  monthReservations,
  user,
}: ReservationFormProps) {
  const [selectedDate] = useQueryState(
    "selectedDate",
    parseAsIsoDateTime.withDefault(new Date()),
  );

  // check if user has already reserved for the selected date
  const isUserAlreadyReservedForDate = useMemo(() => {
    return userHasAlreadyReservedForDate({
      monthReservations,
      user,
      date: selectedDate,
    });
  }, [monthReservations, user, selectedDate]);

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

      <div className="sm:col-span-1">
        <div className="mt-2">
          <Input name="name" placeholder="Your name" />
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="from">
            <option>hi</option>
          </Select>
        </div>
      </div>

      <div className="sm:col-span-2">
        <div className="mt-2">
          <Select name="to">
            <option>hi</option>
          </Select>
        </div>
      </div>

      <div className="sm:col-span-1">
        <div className="mt-2">
          <Button type="submit">Reserve</Button>
        </div>
      </div>
    </form>
  );
}
