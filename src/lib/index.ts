import {
  Resevation as PrismaResevation,
  User as PrismaUser,
} from "@prisma/client";
import { User } from "next-auth";

export interface MonthReservation extends PrismaResevation {
  createdBy: PrismaUser;
}

type userAlreadyReservedForDateProps = {
  monthReservations?: MonthReservation[];
  user?: User;
  date: Date;
};

export const userHasAlreadyReservedForDate = (
  props: userAlreadyReservedForDateProps,
) => {
  const userReservations = props.monthReservations?.filter(
    (reservation) => reservation.createdById === props.user?.id,
  );

  return userReservations?.some(
    (reservation) =>
      new Date(reservation.reservedFrom).getDate() === props.date.getDate(),
  );
};

export const hasAnyEmptySpotLeftForDate = (
  availableReservations: Date[] | undefined,
  date: Date,
) => {
  const selectedDateAvailableSpots = availableReservations?.filter(
    (reservation) => {
      return reservation.getDate() === date.getDate();
    },
  );

  return !selectedDateAvailableSpots?.length;
};

export const getStartAndEndOfReservationForDate = (date: Date) => {
  // setting the start to the selected day, 9 am
  const startReservationTime = new Date(date);
  startReservationTime.setHours(9, 0, 0, 0);

  // setting the end date
  const endReservationTime = new Date(date);
  if (date.getDay() !== 5) {
    // if the selected day is not friday, set the end date to tomorrow 10 am
    endReservationTime.setDate(date.getDate() + 1);
    endReservationTime.setHours(10, 0, 0, 0); // giving 1 hour for the last reservation
  } else {
    // unless the selected day is friday, set the end to 4 pm
    endReservationTime.setHours(16, 0, 0, 0); // giving 1 hour for the last reservation
  }

  return { startReservationTime, endReservationTime };
};

export const generateAvailableHours = (start: Date, end: Date) => {
  const availableHours: Date[] = [];
  while (start <= end) {
    availableHours.push(new Date(start));
    start.setHours(start.getHours() + 1);
  }

  return availableHours;
};

export const getMonthReservationsForDate = (
  monthReservations: MonthReservation[] | undefined,
  date: Date,
) => {
  return monthReservations?.filter(
    (reservation) =>
      new Date(reservation.reservedFrom).getDate() === date.getDate(),
  );
};

export const filterAvailableReservationHours = (
  availableReservationDates: Date[],
  reservationsForDate: MonthReservation[] | undefined,
) => {
  return availableReservationDates.filter((availableDate) => {
    const availableDateTime = availableDate.getTime();
    const availableDateClone = new Date(availableDateTime);
    availableDateClone.setHours(availableDateClone.getHours() + 1);
    const availableDateTimePlusOneHour = availableDateClone.getTime();

    const isDateReserved = reservationsForDate?.filter((reservation) => {
      const reservationFrom = reservation.reservedFrom.getTime();
      const reservationTo = reservation.reservedTo.getTime();

      /**
       * if the available hours is between the reservation `from` and `to`,
       * or if the available hours plus one hour is between the reservation `from` and `to`,
       * then the date is reserved
       */
      return (
        (availableDateTime >= reservationFrom &&
          availableDateTime <= reservationTo) ||
        (availableDateTimePlusOneHour >= reservationFrom &&
          availableDateTimePlusOneHour <= reservationTo)
      );
    });

    return !isDateReserved?.length;
  });
};
