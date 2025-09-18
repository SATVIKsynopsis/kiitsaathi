// Temporary database types to fix build issues
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
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          items: Json
          total_amount: number
          status: string
          delivery_address: string
          payment_status: 'pending' | 'completed' | 'cancelled' | 'failed'
          updated_at?: string
          service_name?: string
          subservice_name?: string
          helper_name?: string
          phone_number?: string
          special_instructions?: string
          transaction_id?: string
          amount?: number
          payment_method?: string
          booking_details?: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          items: Json
          total_amount: number
          status?: string
          delivery_address: string
          payment_status?: 'pending' | 'completed' | 'cancelled' | 'failed'
          updated_at?: string
          service_name?: string
          subservice_name?: string
          helper_name?: string
          phone_number?: string
          special_instructions?: string
          transaction_id?: string
          amount?: number
          payment_method?: string
          booking_details?: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          items?: Json
          total_amount?: number
          status?: string
          delivery_address?: string
          payment_status?: 'pending' | 'completed' | 'cancelled' | 'failed'
          updated_at?: string
          service_name?: string
          subservice_name?: string
          helper_name?: string
          phone_number?: string
          special_instructions?: string
          transaction_id?: string
          amount?: number
          payment_method?: string
          booking_details?: Json
        }
      }
      food_orders: {
        Row: {
          id: number
          created_at: string
          customer_name: string
          phone_number: string
          delivery_location: string
          special_notes?: string
          items: Json
          total_mrp: number
          delivery_charge_percent: number
          total_payable: number
          status: 'pending' | 'accepted' | 'delivered'
          updated_at?: string
          customer_id?: string
          helper_id?: string
        }
        Insert: {
          id?: number
          created_at?: string
          customer_name: string
          phone_number: string
          delivery_location: string
          special_notes?: string
          items: Json
          total_mrp: number
          delivery_charge_percent: number
          total_payable: number
          status?: 'pending' | 'accepted' | 'delivered'
          updated_at?: string
          customer_id?: string
          helper_id?: string
        }
        Update: {
          id?: number
          created_at?: string
          customer_name?: string
          phone_number?: string
          delivery_location?: string
          special_notes?: string
          items?: Json
          total_mrp?: number
          delivery_charge_percent?: number
          total_payable?: number
          status?: 'pending' | 'accepted' | 'delivered'
          updated_at?: string
          customer_id?: string
          helper_id?: string
        }
      }
      calendar_events: {
        Row: {
          id: number
          title: string
          start: string
          end: string
          category: string
          description?: string
          society_name?: string
          event_name?: string
          event_date?: string
          start_time?: string
          end_time?: string
          venue?: string
          organiser?: string
          requirements?: string[]
          validation?: string
        }
        Insert: {
          id?: number
          title: string
          start: string
          end: string
          category: string
          description?: string
          society_name?: string
          event_name?: string
          event_date?: string
          start_time?: string
          end_time?: string
          venue?: string
          organiser?: string
          requirements?: string[]
          validation?: string
        }
        Update: {
          id?: number
          title?: string
          start?: string
          end?: string
          category?: string
          description?: string
          society_name?: string
          event_name?: string
          event_date?: string
          start_time?: string
          end_time?: string
          venue?: string
          organiser?: string
          requirements?: string[]
          validation?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}