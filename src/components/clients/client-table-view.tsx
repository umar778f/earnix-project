"use client"

import * as React from "react"
import { type ClientListItem } from "@/lib/clients/service"
import { formatMoney } from "@/lib/currency/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientDialog } from "@/components/clients/client-dialog"
import { ClientHistorySheet } from "@/components/clients/client-history-sheet"
import { deleteClientAction } from "@/lib/clients/actions"
import {
  Users,
  Search,
  Plus,
  Briefcase,
  Globe,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react"

interface ClientTableViewProps {
  initialClients: ClientListItem[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
}

export function ClientTableView({
  initialClients,
  platforms,
  baseCurrency,
}: ClientTableViewProps) {
  const [search, setSearch] = React.useState("")
  const [platformFilter, setPlatformFilter] = React.useState("all")

  // Modals state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [clientToEdit, setClientToEdit] = React.useState<ClientListItem | null>(null)

  // Drawer state
  const [selectedClient, setSelectedClient] = React.useState<ClientListItem | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // Delete state
  const [deletePendingId, setDeletePendingId] = React.useState<string | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  // Filter logic
  const filteredClients = initialClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.country && c.country.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))

    const matchesPlatform =
      platformFilter === "all" || c.platformCode === platformFilter

    return matchesSearch && matchesPlatform
  })

  const handleOpenAdd = () => {
    setClientToEdit(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (client: ClientListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setClientToEdit(client)
    setDialogOpen(true)
  }

  const handleOpenDetails = (client: ClientListItem) => {
    setSelectedClient(client)
    setDrawerOpen(true)
  }

  const handleDelete = async (clientId: string, clientName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to remove "${clientName}" from your directory?`)) {
      return
    }

    setDeletePendingId(clientId)
    setDeleteError(null)

    const result = await deleteClientAction(clientId)
    setDeletePendingId(null)

    if (!result.success && result.error) {
      setDeleteError(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, country, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All Platforms</option>
            <option value="upwork">Upwork</option>
            <option value="generic_csv">Direct Invoices</option>
            <option value="manual">Manual Entry</option>
          </select>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 cursor-pointer text-xs">
          <Plus className="size-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Delete Audit Error Alert */}
      {deleteError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Financial Ledger Protection</p>
            <p>{deleteError}</p>
          </div>
        </div>
      )}

      {/* Empty Filter State */}
      {filteredClients.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
          <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="size-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No clients found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || platformFilter !== "all"
              ? "No clients match your filter criteria. Try clearing search keywords."
              : "No clients registered in your directory yet. Click 'Add Client' to record your first client."}
          </p>
          {search && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSearch("")
                setPlatformFilter("all")
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        /* Client Directory Table */
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold text-right">Lifetime Earnings</th>
                  <th className="px-4 py-3 font-semibold text-center">Payments</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client) => {
                  const isDeleting = deletePendingId === client.id

                  return (
                    <tr
                      key={client.id}
                      onClick={() => handleOpenDetails(client)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{client.name}</span>
                          </p>
                          {client.email && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="size-3 text-muted-foreground/70" />
                          <span>{client.country || "Global"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border">
                          <Briefcase className="size-3 text-muted-foreground" />
                          <span>{client.platformName}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-bold text-foreground">
                        {formatMoney(client.totalEarningsConverted, baseCurrency)}
                      </td>

                      <td className="px-4 py-3.5 text-center text-muted-foreground">
                        <span className="inline-block rounded-full bg-muted/60 px-2 py-0.5 font-mono text-[11px]">
                          {client.paymentCount}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDetails(client)
                            }}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`View details for ${client.name}`}
                            title="View client details"
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => handleOpenEdit(client, e)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Edit ${client.name}`}
                            title="Edit client"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isDeleting}
                            onClick={(e) => handleDelete(client.id, client.name, e)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Delete ${client.name}`}
                            title="Delete client"
                          >
                            {isDeleting ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Add/Edit Modal */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientToEdit={clientToEdit}
        platforms={platforms}
      />

      {/* Client Detail History Drawer */}
      <ClientHistorySheet
        client={selectedClient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}

