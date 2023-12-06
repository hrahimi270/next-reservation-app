"use client";

import { useQueryState } from "next-usequerystate";
import { parseAsIsoDateTime } from "next-usequerystate/parsers";

import {
  Resevation as PrismaResevation,
  User as PrismaUser,
} from "@prisma/client";
import { useMemo } from "react";

interface Reservation extends PrismaResevation {
  createdBy: PrismaUser;
}

interface ReservationsProps {
  monthReservations?: Reservation[];
}

export default function Reservations({ monthReservations }: ReservationsProps) {
  const [selectedDate] = useQueryState(
    "selectedDate",
    parseAsIsoDateTime.withDefault(new Date()),
  );

  const selectedDateReservations = useMemo(() => {
    return monthReservations?.filter(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === selectedDate.getDate(),
    );
  }, [monthReservations, selectedDate]);

  return (
    <div className="relative ml-4 max-h-[325px] h-[325px] flex grow flex-col overflow-y-auto rounded-md bg-white p-6">
      {selectedDateReservations?.length ? (
        selectedDateReservations.map((reservation) => {
          return (
            <div
              key={reservation.id}
              className="rounded-md border border-gray-200 p-3 mb-4"
            >
              <span className="font-bold">{reservation.createdBy.name}</span> {" - "}
              <span className="text-slate-500">
                {new Date(reservation.reservedFrom).toLocaleTimeString()}
              </span>
              {" to "}
              <span className="text-slate-500">
                {new Date(reservation.reservedTo).toLocaleTimeString()}
              </span>
            </div>
          );
        })
      ) : (
        <div className="self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400">
          No reservations for this day
        </div>
      )}
    </div>
  );
}
