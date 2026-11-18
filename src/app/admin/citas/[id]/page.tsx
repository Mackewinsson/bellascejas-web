import { notFound } from "next/navigation";
import {
  getAppointmentById,
  listAllServices,
  listAllStaff,
} from "@/lib/booking/queries";
import { AppointmentEditor } from "@/components/admin/AppointmentEditor";

export const dynamic = "force-dynamic";

export default async function AdminCitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [appt, services, staff] = await Promise.all([
    getAppointmentById(id),
    listAllServices(),
    listAllStaff(),
  ]);

  if (!appt) notFound();

  return (
    <AppointmentEditor
      appointment={appt}
      services={services}
      staff={staff}
    />
  );
}
