"use client";

/** 
 * Listed below are the tailwind classes used to generate the calendar tile shader.
 */

// !bg-green-100/50
// !bg-green-200/50
// !bg-green-300/50
// !bg-green-400/50
// !bg-green-500/50
// !bg-green-600/50
// !bg-green-700/50
// !bg-green-800/50
// !bg-green-900/50

export default function TileContent(props: { reservations: number }) {
  return (
    <span className="min-w-5 min-h-5 bg-green absolute left-0 top-1 rounded-full bg-red-400 px-1 text-slate-700 opacity-0 group-hover:opacity-100">
      {props.reservations}
    </span>
  );
}
