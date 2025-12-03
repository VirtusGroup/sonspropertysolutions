export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          property_type: string
          state: string
          street: string
          unit: string | null
          updated_at: string | null
          user_id: string
          zip: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          property_type: string
          state: string
          street: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
          zip: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          property_type?: string
          state?: string
          street?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          zip?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_photos: {
        Row: {
          acculynx_file_id: string | null
          caption: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          order_id: string
          storage_path: string
          uploaded_to_acculynx: boolean
        }
        Insert: {
          acculynx_file_id?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          order_id: string
          storage_path: string
          uploaded_to_acculynx?: boolean
        }
        Update: {
          acculynx_file_id?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          order_id?: string
          storage_path?: string
          uploaded_to_acculynx?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_photos_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          acculynx_contact_id: string | null
          acculynx_job_id: string | null
          address_id: string | null
          address_snapshot: Json | null
          completed_at: string | null
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          created_at: string
          estimate_high: number | null
          estimate_low: number | null
          id: string
          job_ref: string
          last_sync_at: string | null
          last_sync_error: string | null
          notes: string | null
          preferred_window: string | null
          property_type: string
          scheduled_at: string | null
          service_category: string | null
          service_id: string
          status: string
          sync_attempts: number | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acculynx_contact_id?: string | null
          acculynx_job_id?: string | null
          address_id?: string | null
          address_snapshot?: Json | null
          completed_at?: string | null
          contact_email: string
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          created_at?: string
          estimate_high?: number | null
          estimate_low?: number | null
          id?: string
          job_ref?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          notes?: string | null
          preferred_window?: string | null
          property_type: string
          scheduled_at?: string | null
          service_category?: string | null
          service_id: string
          status?: string
          sync_attempts?: number | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acculynx_contact_id?: string | null
          acculynx_job_id?: string | null
          address_id?: string | null
          address_snapshot?: Json | null
          completed_at?: string | null
          contact_email?: string
          contact_first_name?: string
          contact_last_name?: string
          contact_phone?: string
          created_at?: string
          estimate_high?: number | null
          estimate_low?: number | null
          id?: string
          job_ref?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          notes?: string | null
          preferred_window?: string | null
          property_type?: string
          scheduled_at?: string | null
          service_category?: string | null
          service_id?: string
          status?: string
          sync_attempts?: number | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          credits: number | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notification_email: boolean | null
          notification_push: boolean | null
          phone: string | null
          referral_code: string | null
          terms_accepted_at: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          phone?: string | null
          referral_code?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notification_email?: boolean | null
          notification_push?: boolean | null
          phone?: string | null
          referral_code?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string
          device_name: string | null
          fcm_token: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          fcm_token: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          fcm_token?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string | null
          id: string
          order_id: string | null
          payload: Json
          processed: boolean
          source: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload: Json
          processed?: boolean
          source: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload?: Json
          processed?: boolean
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: { first_name: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
