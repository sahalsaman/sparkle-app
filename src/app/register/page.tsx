import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { googleEnabled } from "@/lib/auth.config";

export const metadata = { title: "Sign up — Sparkle" };

export default function RegisterPage() {
  return (
    <AuthShell title="Make Monday a vibe." subtitle="Create your company workspace in under a minute.">
      <RegisterForm googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
