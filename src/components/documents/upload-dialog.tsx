"use client"

import * as React from "react"
import { useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadDocumentAction } from "@/lib/documents/actions"
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/documents/schemas"
import { Upload, AlertCircle, FileCheck, FileUp } from "lucide-react"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const handleClose = () => {
    setErrorMsg(null)
    setSelectedFile(null)
    setDragOver(false)
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setErrorMsg(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      setErrorMsg(null)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.")
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set("file", selectedFile)

    startTransition(async () => {
      const result = await uploadDocumentAction(formData)
      if (!result.success) {
        setErrorMsg(result.error || "Failed to upload document.")
      } else {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Upload Document to Vault</DialogTitle>
          <DialogDescription className="text-xs">
            Store receipts, payment statements, client invoices, or tax certificates securely.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-muted/20"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 size-full opacity-0 cursor-pointer"
            />

            {selectedFile ? (
              <div className="space-y-1.5 text-center">
                <div className="flex size-9 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileCheck className="size-5" />
                </div>
                <div className="text-xs font-semibold text-foreground max-w-[240px] truncate">
                  {selectedFile.name}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change file
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 text-center">
                <div className="flex size-9 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileUp className="size-5" />
                </div>
                <div className="text-xs font-medium text-foreground">
                  Choose a file or drag it here
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PDF, PNG, JPEG, WEBP, or CSV up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Document Type Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="documentType" className="text-xs">
              Document Classification *
            </Label>
            <select
              id="documentType"
              name="documentType"
              defaultValue="receipt"
              required
              className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Display Name (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="customFileName" className="text-xs flex items-center justify-between">
              <span>Display File Name</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </Label>
            <Input
              id="customFileName"
              name="customFileName"
              placeholder={selectedFile ? selectedFile.name : "e.g. AWS_October_Invoice_2026.pdf"}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !selectedFile}
              className="gap-1.5"
            >
              <Upload className="size-3.5" />
              <span>{isPending ? "Uploading..." : "Upload Document"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
