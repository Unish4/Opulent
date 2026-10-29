import { SignUp } from "@clerk/react";
import AuthShell from "../../components/auth/AuthShell";
import { clerkAppearance } from "../../config/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="You need an account to place an order."
      altText="Already have an account? Sign in"
      altTo="/sign-in"
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}
