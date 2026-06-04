import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { googleEnabled } from "@/lib/auth.config";

export const metadata = { title: "Log in — Sparkle" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streak going.">
      <LoginForm googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
