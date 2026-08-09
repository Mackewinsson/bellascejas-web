import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./constants";
import { verifyAdminToken, type AdminTokenPayload } from "./jwt";
import { findAdminById } from "./admin-users";

export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAdminToken(token);
    if (!payload) return null;
    const user = await findAdminById(payload.sub);
    if (!user || !user.active) return null;
    return {
      sub: user.id,
      email: user.email,
      name: user.name || payload.name,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}
