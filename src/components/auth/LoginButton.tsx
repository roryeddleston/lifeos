"use client";

import Link from "next/link";

export default function LoginButton({
  className,
  children = "Log in",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href="/api/auth/login"
      className={className}
      aria-label="Log in"
      prefetch={false}
    >
      {children}
    </Link>
  );
}
