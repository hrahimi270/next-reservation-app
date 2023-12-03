import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const reservationRouter = createTRPCRouter({
  create: protectedProcedure
    .mutation(async ({ ctx }) => {
      return ctx.db.resevation.create({
        data: {
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
