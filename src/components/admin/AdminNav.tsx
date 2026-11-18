"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  short: string;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", icon: "📊", label: "Inicio", short: "Inicio", exact: true },
  { href: "/admin/citas", icon: "📅", label: "Citas & Agenda", short: "Citas" },
  { href: "/admin/leads", icon: "👥", label: "Leads & Contactos", short: "Leads" },
  { href: "/admin/promociones", icon: "💌", label: "Promociones & Email", short: "Promos" },
  { href: "/admin/servicios", icon: "💅", label: "Servicios", short: "Serv." },
  { href: "/admin/equipo", icon: "💆", label: "Equipo", short: "Equipo" },
];

/** Vertical sidebar — shown md+ */
export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {NAV.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar — shown on mobile only */
export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="grid grid-cols-6">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="truncate w-full text-center">{item.short}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
