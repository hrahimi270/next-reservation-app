import Link from "next/link";

export default function AuthModal() {
  return (
    <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-xs flex-col items-center justify-center rounded-lg bg-white p-5 shadow-lg">
        <p className="mb-5 text-center font-bold capitalize">
          You need to signin
        </p>
        
        <Link
          href="/api/auth/signin"
          className="flex rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Signin
        </Link>
      </div>
    </div>
  );
}
