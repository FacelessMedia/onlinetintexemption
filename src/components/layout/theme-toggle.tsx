"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="hidden h-5 w-5 text-secondary dark:block" />
      <Moon className="h-5 w-5 text-foreground dark:hidden" />
    </button>
  );
}
