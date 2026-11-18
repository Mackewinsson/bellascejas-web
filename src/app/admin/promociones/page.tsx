import { listLeads } from "@/lib/leads/queries";
import { listCampaignHistory } from "@/lib/email/promotions";
import { PromotionsStudio } from "@/components/admin/PromotionsStudio";

export const dynamic = "force-dynamic";

export default async function AdminPromocionesPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const [leads, history] = await Promise.all([
    listLeads(),
    listCampaignHistory(),
  ]);

  return (
    <PromotionsStudio
      leads={leads}
      history={history}
      initialLeadId={sp.leadId}
      initialEmail={sp.email}
    />
  );
}
