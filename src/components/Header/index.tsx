import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";

export default async function Header() {
  const session = await getServerAuthSession();

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Reservation App
        </h1>
        <div className="ml-auto flex items-center">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              className="mr-3 inline-block h-8 w-8 rounded-full ring-2 ring-white"
              alt={session?.user?.name || "User"}
            />
          ) : null}
          <span className="mr-2 text-sm text-gray-600">
            {session?.user?.name}
          </span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-rose-500 hover:text-rose-700"
          >
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}
