"use client";

import React, { useId } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export default function Select({ children, ...rest }: SelectProps) {
  const id = useId();

  return (
    <select
      id={id}
      {...rest}
      className="block w-full rounded-md border-0 px-2 py-2 text-gray-900 shadow-sm outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
    >
      {children}
    </select>
  );
}
