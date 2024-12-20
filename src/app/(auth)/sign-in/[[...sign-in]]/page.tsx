import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        afterSignInUrl="/dashboard/preferences"
        redirectUrl="/dashboard/preferences"
        signUpUrl="/sign-up"
      />
    </div>
  );
} 