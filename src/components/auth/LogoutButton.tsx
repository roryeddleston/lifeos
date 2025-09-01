"use client";

import Link from "next/link";

export default function LogoutButton({
  className,
  children = "Log out",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href="/api/auth/logout"
      className={className}
      aria-label="Log out"
      prefetch={false}
    >
      {children}
    </Link>
  );
}
