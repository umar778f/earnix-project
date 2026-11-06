export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SourceType = "csv_upwork" | "csv_generic" | "manual" | "demo"
export type TransactionStatus = "completed" | "pending" | "refunded"
export type AiReviewStatus = "unassigned" | "pending_review" | "confirmed" | "rejected"
export type DocumentType = "invoice" | "receipt" | "bank_statement" | "tax_certificate"
export type OcrStatus = "unprocessed" | "processing" | "completed" | "failed"
export type NotificationType = "info" | "warning" | "reminder" | "action_required"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          default_currency: string
          tax_jurisdiction: string
          business_name: string | null
          tax_identifier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          default_currency?: string
          tax_jurisdiction?: string
          business_name?: string | null
          tax_identifier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          default_currency?: string
          tax_jurisdiction?: string
          business_name?: string | null
          tax_identifier?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          id: string
          code: string
          name: string
          icon_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          icon_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          icon_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          country: string | null
          default_platform_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          country?: string | null
          default_platform_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          country?: string | null
          default_platform_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_default_platform_id_fkey"
            columns: ["default_platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          storage_path: string
          mime_type: string
          file_size_bytes: number
          document_type: DocumentType
          ocr_status: OcrStatus
          ocr_extracted_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          storage_path: string
          mime_type: string
          file_size_bytes: number
          document_type?: DocumentType
          ocr_status?: OcrStatus
          ocr_extracted_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          storage_path?: string
          mime_type?: string
          file_size_bytes?: number
          document_type?: DocumentType
          ocr_status?: OcrStatus
          ocr_extracted_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          platform_id: string
          reference_id: string | null
          original_amount: number
          original_currency: string
          exchange_rate: number
          converted_amount: number
          converted_currency: string
          conversion_date: string
          conversion_source: string | null
          payment_date: string
          description: string
          status: TransactionStatus
          source_type: SourceType
          category: string
          ai_review_status: AiReviewStatus
          ai_confidence: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          platform_id: string
          reference_id?: string | null
          original_amount: number
          original_currency: string
          exchange_rate?: number
          converted_amount: number
          converted_currency: string
          conversion_date?: string
          conversion_source?: string | null
          payment_date: string
          description: string
          status?: TransactionStatus
          source_type?: SourceType
          category?: string
          ai_review_status?: AiReviewStatus
          ai_confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          platform_id?: string
          reference_id?: string | null
          original_amount?: number
          original_currency?: string
          exchange_rate?: number
          converted_amount?: number
          converted_currency?: string
          conversion_date?: string
          conversion_source?: string | null
          payment_date?: string
          description?: string
          status?: TransactionStatus
          source_type?: SourceType
          category?: string
          ai_review_status?: AiReviewStatus
          ai_confidence?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          title: string
          original_amount: number
          original_currency: string
          exchange_rate: number
          converted_amount: number
          converted_currency: string
          category: string
          is_tax_deductible: boolean
          tax_category: string | null
          expense_date: string
          ai_review_status: AiReviewStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          title: string
          original_amount: number
          original_currency?: string
          exchange_rate?: number
          converted_amount: number
          converted_currency?: string
          category: string
          is_tax_deductible?: boolean
          tax_category?: string | null
          expense_date: string
          ai_review_status?: AiReviewStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string | null
          title?: string
          original_amount?: number
          original_currency?: string
          exchange_rate?: number
          converted_amount?: number
          converted_currency?: string
          category?: string
          is_tax_deductible?: boolean
          tax_category?: string | null
          expense_date?: string
          ai_review_status?: AiReviewStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tax_profiles: {
        Row: {
          id: string
          user_id: string
          tax_year: string
          jurisdiction_code: string
          estimated_tax_rate: number
          withholding_tax_suffered: number
          custom_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tax_year: string
          jurisdiction_code?: string
          estimated_tax_rate?: number
          withholding_tax_suffered?: number
          custom_rules?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tax_year?: string
          jurisdiction_code?: string
          estimated_tax_rate?: number
          withholding_tax_suffered?: number
          custom_rules?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      exchange_rates: {
        Row: {
          id: string
          base_currency: string
          target_currency: string
          rate: number
          rate_date: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          base_currency: string
          target_currency: string
          rate: number
          rate_date: string
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          base_currency?: string
          target_currency?: string
          rate?: number
          rate_date?: string
          source?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

