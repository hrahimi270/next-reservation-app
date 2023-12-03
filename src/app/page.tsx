import Link from "next/link";

import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-slate-200 px-10 py-3 font-semibold no-underline transition hover:bg-slate-400"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const latestReservation = await api.reservation.getLatest.query();

  return (
    <div className="w-full max-w-xs">
      {latestReservation ? (
        <p className="truncate">
          Your most recent reservation: {latestReservation?.createdBy?.email}
        </p>
      ) : (
        <p>You have no reservation yet.</p>
      )}
    </div>
  );
}
