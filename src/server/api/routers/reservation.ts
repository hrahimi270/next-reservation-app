import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const reservationRouter = createTRPCRouter({
  getMonthReservations: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }))
    .query(async ({ ctx, input }) => {
      const reservations = await ctx.db.resevation.findMany({
        where: {
          AND: [
            {
              reservedFrom: {
                gte: new Date(input.year, input.month - 1, 1),
              },
            },
            {
              reservedTo: {
                lte: new Date(input.year, input.month, 0),
              },
            },
          ],
        },
        include: { createdBy: true },
      });
      return reservations;
    }),
  create: protectedProcedure
    .input(z.object({ reservedFrom: z.string(), reservedTo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.resevation.create({
        data: {
          reservedFrom: input.reservedFrom,
          reservedTo: input.reservedTo,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
