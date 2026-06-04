"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, googleSignInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <>
          <form action={googleSignInAction}>
            <Button type="submit" variant="outline" className="w-full">
              <GoogleMark /> Continue with Google
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete="current-password"
            required
          />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>
        {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
        <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Sparkle?{" "}
        <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M21.6 12.227c0-.668-.06-1.31-.172-1.927H12v3.647h5.396a4.612 4.612 0 0 1-2 3.026v2.51h3.236c1.893-1.745 2.968-4.314 2.968-7.256z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.896 6.62-2.42l-3.235-2.51c-.898.604-2.046.96-3.385.96-2.604 0-4.808-1.76-5.595-4.124H3.064v2.59A9.997 9.997 0 0 0 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.405 13.906A5.998 5.998 0 0 1 6.09 12c0-.662.113-1.304.314-1.906V7.504H3.065A9.997 9.997 0 0 0 2 12c0 1.614.386 3.14 1.064 4.496l3.34-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.47 0 2.788.506 3.825 1.5l2.868-2.868C16.96 3.044 14.7 2 12 2 8.107 2 4.747 4.236 3.064 7.504l3.341 2.59C7.192 7.797 9.396 6.04 12 6.04z"
        fill="#EA4335"
      />
    </svg>
  );
}
