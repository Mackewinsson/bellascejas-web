import { redirect } from "next/navigation";
import { loginAdminAction } from "@/app/admin/auth-actions";
import { getAdminSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing: "Email y password requeridos.",
  invalid: "Credenciales incorrectas.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const sp = await searchParams;
  const error = sp.error ? ERRORS[sp.error] || "No se pudo iniciar sesion." : "";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <form
        action={loginAdminAction}
        className="w-full max-w-sm border rounded-md bg-card p-6 space-y-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">Admin Bellas Cejas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acceso solo para administradores
          </p>
        </div>
        {error ? (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        ) : null}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
