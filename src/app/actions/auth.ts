"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-zA-Z]/, "Needs a letter")
    .regex(/[0-9]/, "Needs a number"),
});

export type AuthFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
} | undefined;

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        message:
          err.type === "CredentialsSignin"
            ? "Email or password is incorrect"
            : "Could not sign you in. Try again.",
      };
    }
    throw err;
  }
  return undefined;
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password } = parsed.data;

  await connectDB();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return { errors: { email: ["That email is already registered"] } };
  }
  const hashed = await bcrypt.hash(password, 10);
  // The app owner is designated by ADMIN_EMAIL; everyone else is a public user.
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const role = adminEmail && email.toLowerCase() === adminEmail ? "ADMIN" : "USER";
  await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { message: "Account created — please log in." };
    }
    throw err;
  }
  return undefined;
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/" });
  redirect("/");
}
