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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_hubs: {
        Row: {
          bhcode: string
          commission_rate: number | null
          created_at: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          manager_name: string | null
          municipality: string
          name: string
          province: string
          status: string | null
          territory_boundaries: Json | null
          territory_name: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bhcode: string
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          manager_name?: string | null
          municipality: string
          name: string
          province: string
          status?: string | null
          territory_boundaries?: Json | null
          territory_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bhcode?: string
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          manager_name?: string | null
          municipality?: string
          name?: string
          province?: string
          status?: string | null
          territory_boundaries?: Json | null
          territory_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_hubs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          business_hub_amount: number | null
          business_hub_id: string | null
          created_at: string | null
          id: string
          loading_station_amount: number | null
          loading_station_id: string | null
          order_id: string
          platform_amount: number | null
          rider_amount: number | null
          rider_id: string | null
        }
        Insert: {
          business_hub_amount?: number | null
          business_hub_id?: string | null
          created_at?: string | null
          id?: string
          loading_station_amount?: number | null
          loading_station_id?: string | null
          order_id: string
          platform_amount?: number | null
          rider_amount?: number | null
          rider_id?: string | null
        }
        Update: {
          business_hub_amount?: number | null
          business_hub_id?: string | null
          created_at?: string | null
          id?: string
          loading_station_amount?: number | null
          loading_station_id?: string | null
          order_id?: string
          platform_amount?: number | null
          rider_amount?: number | null
          rider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_loading_station_id_fkey"
            columns: ["loading_station_id"]
            isOneToOne: false
            referencedRelation: "loading_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      loading_stations: {
        Row: {
          address: string
          area: string
          business_hub_id: string
          commission_rate: number | null
          created_at: string | null
          current_balance: number | null
          id: string
          lscode: string
          name: string
          status: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          area: string
          business_hub_id: string
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          lscode: string
          name: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          area?: string
          business_hub_id?: string
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          lscode?: string
          name?: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loading_stations_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loading_stations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string
          business_name: string
          business_permit: string | null
          business_type: string
          commission_rate: number | null
          created_at: string | null
          dti_permit: string | null
          id: string
          status: string | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          business_name: string
          business_permit?: string | null
          business_type: string
          commission_rate?: number | null
          created_at?: string | null
          dti_permit?: string | null
          id?: string
          status?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          business_name?: string
          business_permit?: string | null
          business_type?: string
          commission_rate?: number | null
          created_at?: string | null
          dti_permit?: string | null
          id?: string
          status?: string | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_hub_id: string | null
          commission_distributed: boolean | null
          created_at: string | null
          customer_id: string
          delivery_fee: number
          distance_km: number
          id: string
          loading_station_id: string | null
          merchant_id: string
          rider_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          business_hub_id?: string | null
          commission_distributed?: boolean | null
          created_at?: string | null
          customer_id: string
          delivery_fee: number
          distance_km: number
          id?: string
          loading_station_id?: string | null
          merchant_id: string
          rider_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          business_hub_id?: string | null
          commission_distributed?: boolean | null
          created_at?: string | null
          customer_id?: string
          delivery_fee?: number
          distance_km?: number
          id?: string
          loading_station_id?: string | null
          merchant_id?: string
          rider_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_loading_station_id_fkey"
            columns: ["loading_station_id"]
            isOneToOne: false
            referencedRelation: "loading_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          current_balance: number | null
          id: string
          loading_station_id: string
          rcode: string
          status: string | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          vehicle_plate: string | null
          vehicle_type: string
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          loading_station_id: string
          rcode: string
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_plate?: string | null
          vehicle_type: string
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          loading_station_id?: string
          rcode?: string
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_plate?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "riders_loading_station_id_fkey"
            columns: ["loading_station_id"]
            isOneToOne: false
            referencedRelation: "loading_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          config_key: string
          config_type: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_type: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      top_ups: {
        Row: {
          amount: number
          approved_by_id: string | null
          bonus_amount: number | null
          bonus_percentage: number | null
          created_at: string | null
          id: string
          is_initial_load: boolean | null
          parent_entity_id: string | null
          parent_entity_type: string | null
          payment_method: string
          processed_at: string | null
          requester_id: string | null
          requester_type: string | null
          status: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          approved_by_id?: string | null
          bonus_amount?: number | null
          bonus_percentage?: number | null
          created_at?: string | null
          id?: string
          is_initial_load?: boolean | null
          parent_entity_id?: string | null
          parent_entity_type?: string | null
          payment_method: string
          processed_at?: string | null
          requester_id?: string | null
          requester_type?: string | null
          status?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          amount?: number
          approved_by_id?: string | null
          bonus_amount?: number | null
          bonus_percentage?: number | null
          created_at?: string | null
          id?: string
          is_initial_load?: boolean | null
          parent_entity_id?: string | null
          parent_entity_type?: string | null
          payment_method?: string
          processed_at?: string | null
          requester_id?: string | null
          requester_type?: string | null
          status?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_topups_approved_by"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_topups_requester_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "top_ups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_balance: number | null
          email: string
          full_name: string
          id: string
          phone_number: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          email: string
          full_name: string
          id?: string
          phone_number?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_topup: {
        Args: { approver_user_id: string; topup_id: string }
        Returns: boolean
      }
      calculate_delivery_fee: {
        Args: { distance_km: number }
        Returns: number
      }
      create_admin_user: {
        Args: { user_email: string; user_full_name: string; user_id: string }
        Returns: {
          admin_user_id: string
          message: string
          success: boolean
        }[]
      }
      create_business_hub_with_auth_complete: {
        Args: {
          hub_name: string
          initial_load_amount?: number
          manager_name: string
          municipality: string
          province: string
          territory_name?: string
          user_email: string
          user_password: string
        }
        Returns: {
          auth_user_id: string
          bhcode: string
          created_hub: Json
          hub_id: string
          message: string
          success: boolean
          topup_id: string
          user_id: string
        }[]
      }
      create_business_hub_with_auth_user: {
        Args: {
          auth_user_id: string
          hub_name: string
          initial_load_amount?: number
          manager_name: string
          municipality: string
          province: string
          territory_name?: string
        }
        Returns: {
          bhcode: string
          hub_id: string
          hub_record: Json
          topup_id: string
          user_id: string
        }[]
      }
      create_business_hub_with_complete_user_info: {
        Args:
          | {
              auth_user_id: string
              hub_name: string
              initial_load_amount?: number
              manager_name: string
              municipality: string
              province: string
              territory_name?: string
              user_email: string
              user_full_name: string
            }
          | {
              auth_user_id: string
              hub_name: string
              initial_load_amount?: number
              manager_name: string
              municipality: string
              province: string
              territory_name?: string
              user_email: string
              user_full_name: string
              user_phone_number?: string
            }
        Returns: {
          bhcode: string
          hub_id: string
          hub_record: Json
          message: string
          success: boolean
          topup_id: string
          user_id: string
        }[]
      }
      create_business_hub_with_initial_load: {
        Args: {
          hub_name: string
          initial_load_amount?: number
          manager_name: string
          municipality: string
          province: string
          territory_name?: string
          user_email?: string
          user_full_name?: string
        }
        Returns: {
          bhcode: string
          created_hub: Json
          hub_id: string
          topup_id: string
          user_id: string
        }[]
      }
      create_business_hub_with_user: {
        Args: {
          hub_name: string
          manager_name: string
          municipality: string
          province: string
          territory_name?: string
          user_email?: string
          user_full_name?: string
        }
        Returns: {
          bhcode: string
          created_hub: Json
          hub_id: string
          user_id: string
        }[]
      }
      delete_business_hub_complete: {
        Args: { hub_id: string }
        Returns: {
          deleted_hub_id: string
          deleted_records: Json
          deleted_user_id: string
          message: string
          success: boolean
        }[]
      }
      generate_bhcode: {
        Args: { municipality_name: string }
        Returns: string
      }
      get_bonus_percentage: {
        Args: { requester_type: string }
        Returns: number
      }
      request_topup: {
        Args: {
          payment_method?: string
          requested_amount: number
          requester_type: string
          requester_user_id: string
        }
        Returns: string
      }
      validate_topup_hierarchy: {
        Args: {
          approver_user_id: string
          requester_type: string
          requester_user_id: string
        }
        Returns: boolean
      }
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