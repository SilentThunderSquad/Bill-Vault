export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bills: {
        Row: {
          id: string
          user_id: string
          product_name: string
          warranty_expiry: string | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          warranty_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string
          warranty_expiry?: string | null
          updated_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          notify_30_days: boolean
          notify_7_days: boolean
          notify_1_day: boolean
          analytics_enabled: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          notify_30_days?: boolean
          notify_7_days?: boolean
          notify_1_day?: boolean
          analytics_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          notify_30_days?: boolean
          notify_7_days?: boolean
          notify_1_day?: boolean
          analytics_enabled?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          bill_id: string
          type: string
          message: string
          is_read: boolean
          metadata: Json | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          bill_id: string
          type: string
          message: string
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bill_id?: string
          type?: string
          message?: string
          is_read?: boolean
          metadata?: Json | null
          updated_at?: string
        }
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
  }
}