"use client";

interface AlreadyReservedMessageProps {
  show?: boolean
}

export default function AlreadyReservedMessage({
  show,
}: AlreadyReservedMessageProps) {
  if (!show) return null;

  return (
    <div className="mb-3 sm:col-span-full">
      <p className="mb-1 mt-3 text-red-500">
        You've already reserved your spot on this day!
      </p>
    </div>
  );
}
