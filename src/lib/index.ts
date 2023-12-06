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
