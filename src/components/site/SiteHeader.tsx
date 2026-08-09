"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (href?: string) =>
    href ? pathname === href || pathname.startsWith(`${href}/`) : false;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          Bellas <span>Cejas</span>
        </Link>

        <nav className="nav-desktop" aria-label="Principal">
          {NAV.map((item) =>
            item.children ? (
              <div className="nav-item" key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="nav-link"
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="nav-link">{item.label}</span>
                )}
                <div className="nav-dropdown">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className="nav-link"
                aria-current={isCurrent(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <Link className="btn btn--primary header-cta" href={SITE.bookingUrl}>
          Reservar
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`nav-mobile${open ? " is-open" : ""}`}
      >
        <div className="container">
          {NAV.map((item) =>
            item.children ? (
              <div className="nav-mobile__group" key={item.label}>
                {item.href ? (
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <div className="nav-mobile__label">{item.label}</div>
                )}
                <div className="nav-mobile__children">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <div style={{ marginTop: "1.25rem" }}>
            <Link className="btn btn--primary" href={SITE.bookingUrl} onClick={() => setOpen(false)}>
              Reservar cita
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
