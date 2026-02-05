import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Welcome to Life OS
        </h1>

        <SignIn
          fallbackRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              cardBox: "w-full max-w-md mx-auto self-center",
              card: "w-full max-w-none mx-auto shadow-none border-0 bg-transparent p-0",

              main: "w-full",
              header: "text-center",
              footer: "justify-center",

              formButtonPrimary:
                "w-full bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition",

              socialButtonsBlockButton: "w-full",
            },
          }}
        />
      </div>
    </main>
  );
}
