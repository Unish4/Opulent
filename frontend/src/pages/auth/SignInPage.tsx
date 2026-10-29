import { SignIn } from "@clerk/react";
import AuthShell from "../../components/auth/AuthShell";
import { clerkAppearance } from "../../config/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to place and track your top-up orders."
      altText="New here? Create an account"
      altTo="/sign-up"
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
