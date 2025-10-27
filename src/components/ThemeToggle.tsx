"use client";

import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <button
      aria-label="Toggle theme"
      className="h-10 w-10 rounded-md border border-[var(--border)] bg-white/60 dark:bg-white/5 backdrop-blur transition-colors hover:bg-white/80 dark:hover:bg-white/10"
      onClick={() => setIsDark((v) => !v)}
      title="Toggle theme"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}




