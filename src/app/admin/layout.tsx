import { redirect } from "next/navigation";
import { headers } from "next/headers";
import "./admin.css";
import {
  AdminSidebarNav,
  AdminBottomNav,
} from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/auth/session";
import { logoutAdminAction } from "@/app/admin/auth-actions";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const session = await getAdminSession();

  // /admin/login is rendered inside this layout; skip chrome when no session
  if (!session) {
    // Only login page should render without session; other pages redirect
    // We detect login by checking children path via middleware cookie challenge:
    // proxy sets x-admin-login=1 for /admin/login
    const isLogin = hdrs.get("x-admin-login") === "1";
    if (isLogin) {
      return (
        <div className="bg-background font-sans min-h-[100dvh]">{children}</div>
      );
    }
    redirect("/admin/login");
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background font-sans">
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card shrink-0">
        <div className="px-4 py-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Bellas Cejas
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">Back Office</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <AdminSidebarNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shrink-0">
          <span className="md:hidden text-sm font-semibold text-foreground">
            Bellas Cejas Admin
          </span>
          <div className="flex items-center justify-between w-full md:w-auto md:ml-auto gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary px-2.5 py-1 rounded-full">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {session.name || session.email}
            </span>
            <form action={logoutAdminAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 bg-background">
          {children}
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
