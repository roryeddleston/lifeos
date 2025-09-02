// app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-4">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Welcome to Life OS
        </h1>
        <SignIn
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              card: "shadow-none border-none",
              formButtonPrimary:
                "bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition",
            },
          }}
        />
      </div>
    </main>
  );
}
