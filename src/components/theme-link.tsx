"use client";

import { useTheme } from "next-themes";

export function ThemeLink({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme)}
      className="underline cursor-pointer"
    >
      {children}
    </button>
  );
}
