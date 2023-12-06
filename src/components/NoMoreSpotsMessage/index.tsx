"use client";

interface NoMoreSpotsMessageProps {
  show?: boolean;
}

export default function NoMoreSpotsMessage({ show }: NoMoreSpotsMessageProps) {
  if (!show) return null;

  return (
    <div className="mb-3 sm:col-span-full">
      <p className="mb-1 mt-3 text-red-500">
        There are no empty spost for the selected day!
      </p>
    </div>
  );
}
