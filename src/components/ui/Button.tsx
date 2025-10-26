"use client";

import React from "react";
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };
  const variants: Record<string, string> = {
    primary: "bg-[var(--primary)] text-white hover:brightness-110",
    secondary: "bg-[var(--secondary)] text-white hover:brightness-110",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10",
  };

  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props} />
  );
}


