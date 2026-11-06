"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { clientSchema } from "@/lib/clients/schemas"

export type ClientActionResult = {
  success: boolean
  error?: string
  message?: string
}

export async function createClientAction(
  prevState: ClientActionResult | null,
  formData: FormData
): Promise<ClientActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Cannot save client to database.",
    }
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email") || "",
    country: formData.get("country") || "",
    defaultPlatformId: formData.get("defaultPlatformId") || "",
    notes: formData.get("notes") || "",
  }

  const parsed = clientSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid client details",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required to add clients.",
    }
  }

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    country: parsed.data.country || null,
    default_platform_id: parsed.data.defaultPlatformId || null,
    notes: parsed.data.notes || null,
  })

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "A client with this name already exists in your directory.",
      }
    }
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/clients")
  revalidatePath("/dashboard")
  return {
    success: true,
    message: "Client added successfully.",
  }
}

export async function updateClientAction(
  clientId: string,
  prevState: ClientActionResult | null,
  formData: FormData
): Promise<ClientActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    }
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email") || "",
    country: formData.get("country") || "",
    defaultPlatformId: formData.get("defaultPlatformId") || "",
    notes: formData.get("notes") || "",
  }

  const parsed = clientSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid client details",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    }
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      country: parsed.data.country || null,
      default_platform_id: parsed.data.defaultPlatformId || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", clientId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/clients")
  revalidatePath("/dashboard")
  return {
    success: true,
    message: "Client updated successfully.",
  }
}

export async function deleteClientAction(clientId: string): Promise<ClientActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    }
  }

  // Audit safety check: Does this client have financial transactions?
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("user_id", user.id)

  if (countError) {
    return {
      success: false,
      error: countError.message,
    }
  }

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete client: ${count} recorded financial transactions are linked to this client. Deleting this client would corrupt your historical income ledger audit trail.`,
    }
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/clients")
  revalidatePath("/dashboard")
  return {
    success: true,
    message: "Client removed from directory.",
  }
}

