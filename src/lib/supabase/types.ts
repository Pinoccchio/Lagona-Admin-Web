export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      top_ups: {
        Row: {
          amount: number
          bonus_amount: number | null
          created_at: string | null
          id: string
          payment_method: string
          status: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          bonus_amount?: number | null
          created_at?: string | null
          id?: string
          payment_method: string
          status?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          amount?: number
          bonus_amount?: number | null
          created_at?: string | null
          id?: string
          payment_method?: string
          status?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
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
      create_admin_user: {
        Args: {
          user_id: string
          user_email: string
          user_full_name: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      create_business_hub_with_user: {
        Args: {
          hub_name: string
          municipality: string
          province: string
          manager_name: string
          territory_name?: string
          user_email?: string
          user_full_name?: string
        }
        Returns: {
          id: string
          name: string
          bhcode: string
        }[]
      }
      create_business_hub_with_initial_load: {
        Args: {
          hub_name: string
          municipality: string
          province: string
          manager_name: string
          territory_name?: string
          initial_load_amount: number
          user_email?: string
          user_full_name?: string
        }
        Returns: {
          id: string
          name: string
          bhcode: string
        }[]
      }
      delete_business_hub_complete: {
        Args: {
          hub_id: string
        }
        Returns: {
          success: boolean
          message: string
          deleted_records: number
          deleted_user_id?: string
        }[]
      }
      create_business_hub_with_complete_user_info: {
        Args: {
          auth_user_id: string
          user_email: string
          user_full_name: string
          hub_name: string
          municipality: string
          province: string
          manager_name: string
          user_phone_number?: string
          territory_name?: string
          initial_load_amount: number
        }
        Returns: {
          success: boolean
          message: string
          hub_record: {
            id: string
            name: string
            bhcode: string
            manager_name: string
            municipality: string
            province: string
            territory_name: string | null
            current_balance: number | null
            initial_balance: number | null
            status: string | null
            user_id: string
          }
        }[]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never