"use client";

import { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ type = "text", ...rest }: InputProps) {
  const id = useId();

  return (
    <input
      type={type}
      id={id}
      {...rest}
      className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm outline-none ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600"
    />
  );
}
