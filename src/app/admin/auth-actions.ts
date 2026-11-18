"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAdminByEmail } from "@/lib/auth/admin-users";
import { ADMIN_COOKIE } from "@/lib/auth/constants";
import { signAdminToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function loginAdminAction(formData: FormData) {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      redirect("/admin/login?error=missing");
    }

    const user = await findAdminByEmail(email);
    if (!user || !user.active) {
      redirect("/admin/login?error=invalid");
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      redirect("/admin/login?error=invalid");
    }

    const token = await signAdminToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const jar = await cookies();
    jar.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    redirect("/admin");
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("LOGIN ACTION ERROR:", err);
    throw err;
  }
}

export async function logoutAdminAction() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}
