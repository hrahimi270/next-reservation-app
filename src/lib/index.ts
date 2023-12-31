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

  return userReservations?.some((reservation) => {
    const reservationDate = new Date(reservation.reservedFrom);
    return reservationDate.getDate() === props.date.getDate();
  });
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
    endReservationTime.setHours(11, 0, 0, 0); // giving 1 hour for the last reservation
  } else {
    // unless the selected day is friday, set the end to 4 pm
    endReservationTime.setHours(17, 0, 0, 0); // giving 1 hour for the last reservation
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

export const getMonthReservationsEndingOnSelectedDate = (
  monthReservations: MonthReservation[] | undefined,
  date: Date,
) => {
  return monthReservations?.filter(
    (reservation) =>
      // theses reservations are ending on the selected date but started the day before
      new Date(reservation.reservedFrom).getDate() === date.getDate() - 1 &&
      new Date(reservation.reservedTo).getDate() === date.getDate(),
  );
};

export const filterAvailableReservationHours = (
  availableReservationDates: Date[],
  reservationsForDate: MonthReservation[] | undefined,
  reservationsEndingOnDate: MonthReservation[] | undefined,
) => {
  return availableReservationDates.filter((availableDate) => {
    const availableDateTime = availableDate.getTime();
    const availableDateTimePlusOneHour = new Date(availableDateTime).setHours(availableDate.getHours() + 1);

    const isDateReserved = reservationsForDate?.some((reservation) => {
      const reservationFrom = reservation.reservedFrom.getTime();
      const reservationTo = reservation.reservedTo.getTime();

      /**
         * if the available hours is between the reservation `from` and `to`,
         * or if the available hours plus one hour is between the reservation `from` and `to`,
         * then the date is reserved
         */
      return (
        (availableDateTime >= reservationFrom && availableDateTime <= reservationTo) ||
        (availableDateTimePlusOneHour >= reservationFrom && availableDateTimePlusOneHour <= reservationTo)
      );
    });

    const isDateReservedByBeforeDay = reservationsEndingOnDate?.some((reservation) => {
      const reservationTo = reservation.reservedTo.getTime();

      /**
           * if the previous day had a reservation that is ending on the selected date (today),
           * we must consider that the selected date is reserved and filter it out
           */
      return availableDateTime <= reservationTo;
    });

    return !isDateReserved && !isDateReservedByBeforeDay;
  });
};

export const generateCalendarTileShader = (
  reservationsLength: number | undefined,
) => {
  let shade = "!bg-white";

  if (reservationsLength && reservationsLength <= 9) {
    shade = `!bg-green-${reservationsLength * 100}/50`;
  } else if (reservationsLength && reservationsLength > 9) {
    shade = "!bg-green-900/75";
  }

  return ["group relative !text-slate-900", shade];
};
