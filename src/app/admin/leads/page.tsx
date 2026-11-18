import { listLeads } from "@/lib/leads/queries";
import { LeadsManager } from "@/components/admin/LeadsManager";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return <LeadsManager initialLeads={leads} />;
}
