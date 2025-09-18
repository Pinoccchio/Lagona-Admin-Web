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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_email: string
          admin_id: string | null
          admin_name: string | null
          changes_summary: string | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_id?: string | null
          admin_name?: string | null
          changes_summary?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_id?: string | null
          admin_name?: string | null
          changes_summary?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hubs: {
        Row: {
          admin_notes: string | null
          bhcode: string
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          last_modified_by: string | null
          location: Json | null
          manager_name: string | null
          municipality: string
          name: string
          province: string
          territory_boundaries: Json | null
          territory_name: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          uses_system_commission_rate: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          bhcode: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          last_modified_by?: string | null
          location?: Json | null
          manager_name?: string | null
          municipality: string
          name: string
          province: string
          territory_boundaries?: Json | null
          territory_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          uses_system_commission_rate?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          bhcode?: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          last_modified_by?: string | null
          location?: Json | null
          manager_name?: string | null
          municipality?: string
          name?: string
          province?: string
          territory_boundaries?: Json | null
          territory_name?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          uses_system_commission_rate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_hubs_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "active_business_hubs"
            referencedColumns: ["id"]
          },
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
      dividend_distributions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          shareholder_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          shareholder_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          shareholder_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dividend_distributions_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      item_variations: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          item_id: string
          name: string
          options: Json | null
          price_adjustment: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item_id: string
          name: string
          options?: Json | null
          price_adjustment?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          item_id?: string
          name?: string
          options?: Json | null
          price_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_variations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
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
          created_by: string | null
          current_balance: number | null
          id: string
          last_modified_by: string | null
          lscode: string
          name: string
          status: string | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          uses_system_commission_rate: boolean | null
        }
        Insert: {
          address: string
          area: string
          business_hub_id: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          id?: string
          last_modified_by?: string | null
          lscode: string
          name: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          uses_system_commission_rate?: boolean | null
        }
        Update: {
          address?: string
          area?: string
          business_hub_id?: string
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          current_balance?: number | null
          id?: string
          last_modified_by?: string | null
          lscode?: string
          name?: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          uses_system_commission_rate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "loading_stations_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "active_business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loading_stations_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loading_stations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loading_stations_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          merchant_id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant_id: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant_id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_halal: boolean | null
          is_spicy: boolean | null
          is_vegetarian: boolean | null
          merchant_id: string
          name: string
          nutrition_info: string | null
          preparation_time: number | null
          price: number
          sort_order: number | null
          status: string | null
          updated_at: string | null
          variations: Json | null
        }
        Insert: {
          allergens?: string[] | null
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_halal?: boolean | null
          is_spicy?: boolean | null
          is_vegetarian?: boolean | null
          merchant_id: string
          name: string
          nutrition_info?: string | null
          preparation_time?: number | null
          price: number
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          variations?: Json | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_halal?: boolean | null
          is_spicy?: boolean | null
          is_vegetarian?: boolean | null
          merchant_id?: string
          name?: string
          nutrition_info?: string | null
          preparation_time?: number | null
          price?: number
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_analytics: {
        Row: {
          average_order_value: number | null
          average_preparation_time: number | null
          cancellation_rate: number | null
          created_at: string | null
          customer_ratings: number | null
          date: string
          id: string
          merchant_id: string
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          cancellation_rate?: number | null
          created_at?: string | null
          customer_ratings?: number | null
          date: string
          id?: string
          merchant_id: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_order_value?: number | null
          average_preparation_time?: number | null
          cancellation_rate?: number | null
          created_at?: string | null
          customer_ratings?: number | null
          date?: string
          id?: string
          merchant_id?: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_analytics_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          merchant_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_categories_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_documents: {
        Row: {
          created_at: string | null
          document_type: string
          expiry_date: string | null
          file_url: string
          id: string
          merchant_id: string
          rejection_reason: string | null
          updated_at: string | null
          upload_date: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expiry_date?: string | null
          file_url: string
          id?: string
          merchant_id: string
          rejection_reason?: string | null
          updated_at?: string | null
          upload_date?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          merchant_id?: string
          rejection_reason?: string | null
          updated_at?: string | null
          upload_date?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_documents_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_items: {
        Row: {
          allergens: string[] | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          ingredients: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          merchant_id: string
          name: string
          nutritional_info: Json | null
          photos: string[] | null
          preparation_time: number | null
          price: number
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          merchant_id: string
          name: string
          nutritional_info?: Json | null
          photos?: string[] | null
          preparation_time?: number | null
          price: number
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          merchant_id?: string
          name?: string
          nutritional_info?: Json | null
          photos?: string[] | null
          preparation_time?: number | null
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "merchant_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_operating_hours: {
        Row: {
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          merchant_id: string
          open_time: string | null
        }
        Insert: {
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          merchant_id: string
          open_time?: string | null
        }
        Update: {
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          merchant_id?: string
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_operating_hours_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          accepting_orders: boolean | null
          address: string
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          barangay: string | null
          bhcode: string | null
          bir_permit: string | null
          business_description: string | null
          business_hub_id: string | null
          business_logo: string | null
          business_name: string
          business_permit: string | null
          business_type: string
          commission_rate: number | null
          contact_number: string | null
          coordinates: Json | null
          created_at: string | null
          delivery_radius: number | null
          distance_from_hub_center: number | null
          district: string | null
          dti_permit: string | null
          food_license: string | null
          formatted_address: string | null
          gcash_number: string | null
          gcash_qr_code: string | null
          hierarchical_address: string | null
          id: string
          is_open: boolean | null
          is_within_territory_bounds: boolean | null
          location: Json | null
          location_accuracy_meters: number | null
          location_selected_at: string | null
          location_source: string | null
          location_validation_status: string | null
          mcode: string | null
          minimum_order: number | null
          municipality: string | null
          operating_hours: Json | null
          plus_code: string | null
          preparation_time: number | null
          province: string | null
          rating_count: number | null
          region: string | null
          rejection_reason: string | null
          status: string | null
          territory_boundaries: Json | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
          zone: string | null
        }
        Insert: {
          accepting_orders?: boolean | null
          address: string
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          barangay?: string | null
          bhcode?: string | null
          bir_permit?: string | null
          business_description?: string | null
          business_hub_id?: string | null
          business_logo?: string | null
          business_name: string
          business_permit?: string | null
          business_type: string
          commission_rate?: number | null
          contact_number?: string | null
          coordinates?: Json | null
          created_at?: string | null
          delivery_radius?: number | null
          distance_from_hub_center?: number | null
          district?: string | null
          dti_permit?: string | null
          food_license?: string | null
          formatted_address?: string | null
          gcash_number?: string | null
          gcash_qr_code?: string | null
          hierarchical_address?: string | null
          id?: string
          is_open?: boolean | null
          is_within_territory_bounds?: boolean | null
          location?: Json | null
          location_accuracy_meters?: number | null
          location_selected_at?: string | null
          location_source?: string | null
          location_validation_status?: string | null
          mcode?: string | null
          minimum_order?: number | null
          municipality?: string | null
          operating_hours?: Json | null
          plus_code?: string | null
          preparation_time?: number | null
          province?: string | null
          rating_count?: number | null
          region?: string | null
          rejection_reason?: string | null
          status?: string | null
          territory_boundaries?: Json | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
          zone?: string | null
        }
        Update: {
          accepting_orders?: boolean | null
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          barangay?: string | null
          bhcode?: string | null
          bir_permit?: string | null
          business_description?: string | null
          business_hub_id?: string | null
          business_logo?: string | null
          business_name?: string
          business_permit?: string | null
          business_type?: string
          commission_rate?: number | null
          contact_number?: string | null
          coordinates?: Json | null
          created_at?: string | null
          delivery_radius?: number | null
          distance_from_hub_center?: number | null
          district?: string | null
          dti_permit?: string | null
          food_license?: string | null
          formatted_address?: string | null
          gcash_number?: string | null
          gcash_qr_code?: string | null
          hierarchical_address?: string | null
          id?: string
          is_open?: boolean | null
          is_within_territory_bounds?: boolean | null
          location?: Json | null
          location_accuracy_meters?: number | null
          location_selected_at?: string | null
          location_source?: string | null
          location_validation_status?: string | null
          mcode?: string | null
          minimum_order?: number | null
          municipality?: string | null
          operating_hours?: Json | null
          plus_code?: string | null
          preparation_time?: number | null
          province?: string | null
          rating_count?: number | null
          region?: string | null
          rejection_reason?: string | null
          status?: string | null
          territory_boundaries?: Json | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "active_business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchants_business_hub_id_fkey"
            columns: ["business_hub_id"]
            isOneToOne: false
            referencedRelation: "business_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
          variations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          order_id: string
          quantity?: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
          variations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "merchant_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
            referencedRelation: "active_business_hubs"
            referencedColumns: ["id"]
          },
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
          address: string | null
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          cancelled_deliveries: number | null
          commission_rate: number | null
          completed_deliveries: number | null
          created_at: string | null
          current_balance: number | null
          current_location: Json | null
          documents: Json | null
          emergency_contact: Json | null
          id: string
          is_available: boolean | null
          is_online: boolean | null
          loading_station_id: string
          profile_photo: string | null
          rating_count: number | null
          rcode: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          vehicle_details: Json | null
          vehicle_plate: string | null
          vehicle_type: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          cancelled_deliveries?: number | null
          commission_rate?: number | null
          completed_deliveries?: number | null
          created_at?: string | null
          current_balance?: number | null
          current_location?: Json | null
          documents?: Json | null
          emergency_contact?: Json | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          loading_station_id: string
          profile_photo?: string | null
          rating_count?: number | null
          rcode: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_details?: Json | null
          vehicle_plate?: string | null
          vehicle_type: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          cancelled_deliveries?: number | null
          commission_rate?: number | null
          completed_deliveries?: number | null
          created_at?: string | null
          current_balance?: number | null
          current_location?: Json | null
          documents?: Json | null
          emergency_contact?: Json | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          loading_station_id?: string
          profile_photo?: string | null
          rating_count?: number | null
          rcode?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_details?: Json | null
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
      shareholders: {
        Row: {
          created_at: string | null
          id: string
          initial_investment: number | null
          last_dividend_date: string | null
          ownership_percentage: number
          pending_dividends: number | null
          status: string | null
          total_dividends: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_investment?: number | null
          last_dividend_date?: string | null
          ownership_percentage: number
          pending_dividends?: number | null
          status?: string | null
          total_dividends?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_investment?: number | null
          last_dividend_date?: string | null
          ownership_percentage?: number
          pending_dividends?: number | null
          status?: string | null
          total_dividends?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shareholders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          affects_existing_entities: boolean | null
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
          affects_existing_entities?: boolean | null
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
          affects_existing_entities?: boolean | null
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
      territory_radius_options: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          radius_km: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          radius_km: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          radius_km?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
          email_verified_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          phone_verified_at: string | null
          profile_image_url: string | null
          role: string
          role_data: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          email: string
          email_verified_at?: string | null
          full_name: string
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          profile_image_url?: string | null
          role: string
          role_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          email?: string
          email_verified_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          phone_verified_at?: string | null
          profile_image_url?: string | null
          role?: string
          role_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_business_hubs: {
        Row: {
          barangay: string | null
          bhcode: string | null
          commission_rate: number | null
          coordinates: Json | null
          created_at: string | null
          district: string | null
          hierarchical_address: string | null
          id: string | null
          location: Json | null
          manager_name: string | null
          municipality: string | null
          name: string | null
          province: string | null
          region: string | null
          territory_boundaries: Json | null
          territory_name: string | null
          user_email: string | null
          user_full_name: string | null
          user_phone: string | null
          user_status: string | null
          zone: string | null
        }
        Relationships: []
      }
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
      calculate_order_commission: {
        Args: { delivery_fee: number; food_total: number; order_id: string }
        Returns: {
          business_hub_amount: number
          loading_station_amount: number
          platform_fee: number
          rider_amount: number
          total_distributed: number
        }[]
      }
      check_territory_availability: {
        Args: { p_territory_id: string }
        Returns: boolean
      }
      cleanup_orphaned_business_hub_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_count: number
          cleaned_emails: string[]
        }[]
      }
      consolidate_business_hub_location_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      consolidate_merchant_location_data: {
        Args: Record<PropertyKey, never>
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
      generate_merchant_code: {
        Args: { business_hub_id: string }
        Returns: string
      }
      get_active_business_hub: {
        Args: { p_municipality: string; p_province: string }
        Returns: {
          bhcode: string
          commission_rate: number
          coordinates: Json
          id: string
          manager_name: string
          name: string
          territory_boundaries: Json
          territory_name: string
          user_status: string
        }[]
      }
      get_bonus_percentage: {
        Args: { requester_type: string }
        Returns: number
      }
      get_merchant_density_by_hub: {
        Args: { p_business_hub_id: string }
        Returns: {
          active_merchants: number
          business_hub_id: string
          business_hub_name: string
          merchant_density_per_km2: number
          pending_merchants: number
          territory_radius_km: number
        }[]
      }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_changes_summary?: string
          p_entity_id: string
          p_entity_name: string
          p_entity_type: string
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
      propagate_commission_rates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      update_business_hub_with_user_status: {
        Args: {
          admin_id: string
          hub_id: string
          new_hub_status: string
          new_user_status: string
          status_notes?: string
        }
        Returns: Json
      }
      validate_business_hub_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          orphaned_business_hubs: number
          orphaned_users: number
          total_business_hub_users: number
          total_business_hubs: number
        }[]
      }
      validate_merchant_territory: {
        Args: {
          p_business_hub_id: string
          p_delivery_radius: number
          p_merchant_coordinates: Json
        }
        Returns: boolean
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