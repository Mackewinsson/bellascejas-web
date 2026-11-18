"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLead, updateLead, deleteLead } from "@/lib/leads/queries";
import type { LeadStatus, LeadSource } from "@/lib/leads/types";

export async function actionCreateLead(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const source = (formData.get("source") || "manual") as LeadSource;
  const status = (formData.get("status") || "nuevo") as LeadStatus;
  const notes = String(formData.get("notes") || "").trim();

  if (!name || !email) {
    throw new Error("Nombre y correo son requeridos.");
  }

  const created = await createLead({
    name,
    email,
    phone,
    source,
    status,
    notes,
  });

  revalidatePath("/admin/leads");
  return created.id;
}

export async function actionUpdateLead(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const status = (formData.get("status") || "nuevo") as LeadStatus;
  const notes = String(formData.get("notes") || "").trim();

  await updateLead(id, {
    name,
    email,
    phone,
    status,
    notes,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function actionDeleteLead(id: string) {
  await deleteLead(id);
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function actionUpdateLeadStatus(id: string, status: LeadStatus) {
  await updateLead(id, { status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}
