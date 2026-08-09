import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <div className="site-shell">
        <SiteHeader />
        <main id="contenido" className="site-main">
          {children}
        </main>
        <SiteFooter />
      </div>
      <WhatsAppFloat />
    </>
  );
}
