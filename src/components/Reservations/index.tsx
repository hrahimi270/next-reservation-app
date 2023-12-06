"use client";

import { useMemo } from "react";
import { MonthReservation } from "@/lib";
import { useReservationStore } from "@/store/useReservationStore";
import NoReservationsEmptyState from "../NoReservationsEmptyState";

interface ReservationsProps {
  monthReservations?: MonthReservation[];
}

export default function Reservations({ monthReservations }: ReservationsProps) {
  const selectedDate = useReservationStore((state) => state.selectedDate);

  const selectedDateReservations = useMemo(() => {
    return monthReservations?.filter(
      (reservation) =>
        new Date(reservation.reservedFrom).getDate() === selectedDate.getDate(),
    );
  }, [monthReservations, selectedDate]);

  return (
    <div className="relative ml-4 flex h-[325px] max-h-[325px] grow flex-col overflow-y-auto rounded-md bg-white p-6">
      {selectedDateReservations?.length ? (
        selectedDateReservations.map((reservation) => {
          return (
            <div
              key={reservation.id}
              className="mb-3 rounded-md border border-gray-200 p-3"
            >
              <span className="font-bold mr-2">{reservation.createdBy.name}</span>
              {"-"}
              <span className="text-slate-500 mx-2">
                {new Date(reservation.reservedFrom).toLocaleTimeString()}
              </span>
              {"to"}
              <span className="text-slate-500 ml-2">
                {new Date(reservation.reservedTo).toLocaleTimeString()}
              </span>
            </div>
          );
        })
      ) : (
        <NoReservationsEmptyState />
      )}
    </div>
  );
}
