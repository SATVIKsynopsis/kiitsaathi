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
      admin_action_logs: {
        Row: {
          action: string
          command: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          command?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          command?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_email: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          payload: Json | null
          reason: string | null
          target_id: string
          target_table: string
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          reason?: string | null
          target_id: string
          target_table: string
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          reason?: string | null
          target_id?: string
          target_table?: string
        }
        Relationships: []
      }
      assignment_files: {
        Row: {
          assignment_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_files_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_helpers: {
        Row: {
          contact: string
          course: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          sample_description: string | null
          specializations: string[] | null
          total_assignments: number | null
          updated_at: string
          user_id: string | null
          year: string
        }
        Insert: {
          contact: string
          course: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          sample_description?: string | null
          specializations?: string[] | null
          total_assignments?: number | null
          updated_at?: string
          user_id?: string | null
          year: string
        }
        Update: {
          contact?: string
          course?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          sample_description?: string | null
          specializations?: string[] | null
          total_assignments?: number | null
          updated_at?: string
          user_id?: string | null
          year?: string
        }
        Relationships: []
      }
      assignment_requests: {
        Row: {
          assigned_at: string | null
          branch: string
          completed_at: string | null
          created_at: string
          deadline: string
          delivery_method: string
          helper_id: string | null
          hostel_name: string
          id: string
          is_urgent: boolean
          match_handwriting: boolean
          pages: number
          room_number: string
          special_instructions: string | null
          status: string
          student_name: string
          total_price: number
          updated_at: string
          user_id: string | null
          whatsapp_number: string
          year: string
        }
        Insert: {
          assigned_at?: string | null
          branch: string
          completed_at?: string | null
          created_at?: string
          deadline: string
          delivery_method?: string
          helper_id?: string | null
          hostel_name: string
          id?: string
          is_urgent?: boolean
          match_handwriting?: boolean
          pages: number
          room_number: string
          special_instructions?: string | null
          status?: string
          student_name: string
          total_price: number
          updated_at?: string
          user_id?: string | null
          whatsapp_number: string
          year: string
        }
        Update: {
          assigned_at?: string | null
          branch?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string
          delivery_method?: string
          helper_id?: string | null
          hostel_name?: string
          id?: string
          is_urgent?: boolean
          match_handwriting?: boolean
          pages?: number
          room_number?: string
          special_instructions?: string | null
          status?: string
          student_name?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string
          year?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bakery_partners: {
        Row: {
          address: string
          contact_person: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string
        }
        Insert: {
          address: string
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
        }
        Update: {
          address?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      book_buyback_requests: {
        Row: {
          admin_notes: string | null
          books_details: Json
          contact_number: string
          created_at: string
          estimated_total: number | null
          evaluation_date: string | null
          final_amount: number | null
          id: string
          payment_preference: string
          pickup_address: string
          roll_number: string
          status: string
          student_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          books_details: Json
          contact_number: string
          created_at?: string
          estimated_total?: number | null
          evaluation_date?: string | null
          final_amount?: number | null
          id?: string
          payment_preference: string
          pickup_address: string
          roll_number: string
          status?: string
          student_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          books_details?: Json
          contact_number?: string
          created_at?: string
          estimated_total?: number | null
          evaluation_date?: string | null
          final_amount?: number | null
          id?: string
          payment_preference?: string
          pickup_address?: string
          roll_number?: string
          status?: string
          student_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_exchanges: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          status: string | null
          user1_books: Json
          user1_id: string
          user1_wants: Json
          user2_books: Json
          user2_id: string
          user2_wants: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user1_books: Json
          user1_id: string
          user1_wants: Json
          user2_books: Json
          user2_id: string
          user2_wants: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user1_books?: Json
          user1_id?: string
          user1_wants?: Json
          user2_books?: Json
          user2_id?: string
          user2_wants?: Json
        }
        Relationships: []
      }
      book_inventory: {
        Row: {
          buyer_id: string | null
          condition: string
          contact_info: Json | null
          created_at: string
          id: string
          photos: Json | null
          seller_submission_id: string | null
          selling_price: number
          semester_book_id: string
          sold_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          condition: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          photos?: Json | null
          seller_submission_id?: string | null
          selling_price: number
          semester_book_id: string
          sold_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          condition?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          photos?: Json | null
          seller_submission_id?: string | null
          selling_price?: number
          semester_book_id?: string
          sold_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_inventory_seller_submission_id_fkey"
            columns: ["seller_submission_id"]
            isOneToOne: false
            referencedRelation: "book_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_inventory_semester_book_id_fkey"
            columns: ["semester_book_id"]
            isOneToOne: false
            referencedRelation: "semester_books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_listings: {
        Row: {
          author: string
          condition: string
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          price: number
          semester: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          author: string
          condition: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          price: number
          semester?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          author?: string
          condition?: string
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          price?: number
          semester?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      book_orders: {
        Row: {
          admin_notes: string | null
          books: Json
          buyer_id: string
          contact_number: string
          created_at: string
          delivery_address: string
          id: string
          order_status: string
          payment_method: string
          payment_status: string
          seller_submission_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          books: Json
          buyer_id: string
          contact_number: string
          created_at?: string
          delivery_address: string
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          seller_submission_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          books?: Json
          buyer_id?: string
          contact_number?: string
          created_at?: string
          delivery_address?: string
          id?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          seller_submission_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_orders_seller_submission_id_fkey"
            columns: ["seller_submission_id"]
            isOneToOne: false
            referencedRelation: "book_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      book_purchase_requests: {
        Row: {
          admin_notes: string | null
          book_set_needed: string
          contact_number: string
          created_at: string
          full_name: string
          id: string
          roll_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          book_set_needed: string
          contact_number: string
          created_at?: string
          full_name: string
          id?: string
          roll_number: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          book_set_needed?: string
          contact_number?: string
          created_at?: string
          full_name?: string
          id?: string
          roll_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_submissions: {
        Row: {
          admin_notes: string | null
          bank_account: string | null
          bonus_amount: number | null
          bonus_applicable: boolean | null
          book_condition: string
          book_titles: string
          branch: string
          contact_number: string
          created_at: string
          email: string
          final_price: number | null
          full_name: string
          id: string
          ifsc_code: string | null
          payment_status: string | null
          photo_urls: string[] | null
          pickup_location: string
          pickup_scheduled_at: string | null
          roll_number: string
          selected_books: Json | null
          semester: number | null
          status: string
          terms_accepted: boolean
          total_estimated_price: number | null
          updated_at: string
          upi_id: string | null
          user_id: string | null
          verification_notes: string | null
          worker_verified: boolean | null
          year_of_study: string
        }
        Insert: {
          admin_notes?: string | null
          bank_account?: string | null
          bonus_amount?: number | null
          bonus_applicable?: boolean | null
          book_condition: string
          book_titles: string
          branch: string
          contact_number: string
          created_at?: string
          email: string
          final_price?: number | null
          full_name: string
          id?: string
          ifsc_code?: string | null
          payment_status?: string | null
          photo_urls?: string[] | null
          pickup_location: string
          pickup_scheduled_at?: string | null
          roll_number: string
          selected_books?: Json | null
          semester?: number | null
          status?: string
          terms_accepted?: boolean
          total_estimated_price?: number | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string | null
          verification_notes?: string | null
          worker_verified?: boolean | null
          year_of_study: string
        }
        Update: {
          admin_notes?: string | null
          bank_account?: string | null
          bonus_amount?: number | null
          bonus_applicable?: boolean | null
          book_condition?: string
          book_titles?: string
          branch?: string
          contact_number?: string
          created_at?: string
          email?: string
          final_price?: number | null
          full_name?: string
          id?: string
          ifsc_code?: string | null
          payment_status?: string | null
          photo_urls?: string[] | null
          pickup_location?: string
          pickup_scheduled_at?: string | null
          roll_number?: string
          selected_books?: Json | null
          semester?: number | null
          status?: string
          terms_accepted?: boolean
          total_estimated_price?: number | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string | null
          verification_notes?: string | null
          worker_verified?: boolean | null
          year_of_study?: string
        }
        Relationships: []
      }
      book_verifications: {
        Row: {
          final_amount: number
          id: string
          photos_after_verification: Json | null
          price_adjustments: Json | null
          submission_id: string
          verification_notes: string | null
          verified_at: string
          verified_books: Json
          worker_id: string
        }
        Insert: {
          final_amount: number
          id?: string
          photos_after_verification?: Json | null
          price_adjustments?: Json | null
          submission_id: string
          verification_notes?: string | null
          verified_at?: string
          verified_books: Json
          worker_id: string
        }
        Update: {
          final_amount?: number
          id?: string
          photos_after_verification?: Json | null
          price_adjustments?: Json | null
          submission_id?: string
          verification_notes?: string | null
          verified_at?: string
          verified_books?: Json
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_verifications_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "book_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_verifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "book_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      book_workers: {
        Row: {
          contact: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          password_hash: string
          total_verifications: number | null
          updated_at: string
          worker_code: string
        }
        Insert: {
          contact: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          password_hash: string
          total_verifications?: number | null
          updated_at?: string
          worker_code: string
        }
        Update: {
          contact?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          password_hash?: string
          total_verifications?: number | null
          updated_at?: string
          worker_code?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          category: string
          created_at: string | null
          description: string
          end_time: string | null
          event_date: string
          event_name: string
          id: number
          organiser: string
          requirements: string[] | null
          society_name: string
          start_time: string | null
          validation: boolean
          venue: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          end_time?: string | null
          event_date: string
          event_name: string
          id?: number
          organiser: string
          requirements?: string[] | null
          society_name: string
          start_time?: string | null
          validation?: boolean
          venue: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          end_time?: string | null
          event_date?: string
          event_name?: string
          id?: number
          organiser?: string
          requirements?: string[] | null
          society_name?: string
          start_time?: string | null
          validation?: boolean
          venue?: string
        }
        Relationships: []
      }
      campus_tour_bookings: {
        Row: {
          admin_notes: string | null
          contact_number: string
          created_at: string
          email: string | null
          group_size: number
          guest_name: string
          id: string
          price: number
          selected_date: string
          selected_slot: string
          special_requests: string | null
          status: string
          tour_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_number: string
          created_at?: string
          email?: string | null
          group_size?: number
          guest_name: string
          id?: string
          price?: number
          selected_date: string
          selected_slot: string
          special_requests?: string | null
          status?: string
          tour_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_number?: string
          created_at?: string
          email?: string | null
          group_size?: number
          guest_name?: string
          id?: string
          price?: number
          selected_date?: string
          selected_slot?: string
          special_requests?: string | null
          status?: string
          tour_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      carton_transfer_bookings: {
        Row: {
          admin_notes: string | null
          created_at: string
          full_name: string
          hostel_name: string
          id: string
          mobile_number: string
          need_tape: boolean
          number_of_boxes: number
          payment_method: string
          pickup_slot: string
          room_number: string
          status: string
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          full_name: string
          hostel_name: string
          id?: string
          mobile_number: string
          need_tape?: boolean
          number_of_boxes: number
          payment_method: string
          pickup_slot: string
          room_number: string
          status?: string
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          full_name?: string
          hostel_name?: string
          id?: string
          mobile_number?: string
          need_tape?: boolean
          number_of_boxes?: number
          payment_method?: string
          pickup_slot?: string
          room_number?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      celebration_bookings: {
        Row: {
          admin_notes: string | null
          bakery_fulfilled: boolean | null
          celebration_type: string
          contact_number: string
          created_at: string
          date_time: string
          id: string
          name: string
          payment_completed: boolean | null
          promo_code: string | null
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string | null
          venue_location: string
        }
        Insert: {
          admin_notes?: string | null
          bakery_fulfilled?: boolean | null
          celebration_type: string
          contact_number: string
          created_at?: string
          date_time: string
          id?: string
          name: string
          payment_completed?: boolean | null
          promo_code?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_location: string
        }
        Update: {
          admin_notes?: string | null
          bakery_fulfilled?: boolean | null
          celebration_type?: string
          contact_number?: string
          created_at?: string
          date_time?: string
          id?: string
          name?: string
          payment_completed?: boolean | null
          promo_code?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_location?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          flagged_reason: string | null
          id: string
          is_flagged: boolean | null
          message: string
          sender_id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          message: string
          sender_id: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          message?: string
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          session_type: string | null
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          session_type?: string | null
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          session_type?: string | null
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      demo_names: {
        Row: {
          category: string
          id: string
          is_used: boolean | null
          name: string
        }
        Insert: {
          category: string
          id?: string
          is_used?: boolean | null
          name: string
        }
        Update: {
          category?: string
          id?: string
          is_used?: boolean | null
          name?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          branch: string | null
          created_at: string | null
          id: number
          pdf_url: string
          semester: string
          subject: string
          title: string
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string
          views: number | null
          year: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string | null
          id?: number
          pdf_url: string
          semester: string
          subject: string
          title: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by: string
          views?: number | null
          year?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string | null
          id?: number
          pdf_url?: string
          semester?: string
          subject?: string
          title?: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string
          views?: number | null
          year?: string | null
        }
        Relationships: []
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          member_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id: string
          id?: string
          member_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          group_id: string
          id: string
          notes: string | null
          paid_by_member_id: string
          receipt_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          group_id: string
          id?: string
          notes?: string | null
          paid_by_member_id: string
          receipt_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          group_id?: string
          id?: string
          notes?: string | null
          paid_by_member_id?: string
          receipt_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_member_id_fkey"
            columns: ["paid_by_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_members: {
        Row: {
          category: string
          created_at: string | null
          department: string | null
          designation: string
          email: string
          id: string
          linkedin: string | null
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          department?: string | null
          designation: string
          email: string
          id?: string
          linkedin?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          department?: string | null
          designation?: string
          email?: string
          id?: string
          linkedin?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string
          delivery_charge_percent: number
          delivery_location: string
          helper_id: string | null
          id: number
          items: Json
          phone_number: string
          special_notes: string | null
          status: string
          total_mrp: number
          total_payable: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name: string
          delivery_charge_percent?: number
          delivery_location: string
          helper_id?: string | null
          id?: number
          items: Json
          phone_number: string
          special_notes?: string | null
          status?: string
          total_mrp: number
          total_payable: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          delivery_charge_percent?: number
          delivery_location?: string
          helper_id?: string | null
          id?: number
          items?: Json
          phone_number?: string
          special_notes?: string | null
          status?: string
          total_mrp?: number
          total_payable?: number
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          email_phone: string
          group_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email_phone: string
          group_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email_phone?: string
          group_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      helper_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          shopkeeper_email: string | null
          shopkeeper_whatsapp: string | null
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          shopkeeper_email?: string | null
          shopkeeper_whatsapp?: string | null
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          shopkeeper_email?: string | null
          shopkeeper_whatsapp?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean | null
        }
        Relationships: []
      }
      interview_event_requests: {
        Row: {
          category: string
          created_at: string | null
          description: string
          end_time: string | null
          event_date: string
          event_name: string
          id: string
          notes: string | null
          organiser: string
          rejection_reason: string | null
          requester_email: string
          requirements: string[] | null
          society_name: string
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          validation: boolean | null
          venue: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          end_time?: string | null
          event_date: string
          event_name: string
          id?: string
          notes?: string | null
          organiser: string
          rejection_reason?: string | null
          requester_email: string
          requirements?: string[] | null
          society_name: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation?: boolean | null
          venue: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          end_time?: string | null
          event_date?: string
          event_name?: string
          id?: string
          notes?: string | null
          organiser?: string
          rejection_reason?: string | null
          requester_email?: string
          requirements?: string[] | null
          society_name?: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation?: boolean | null
          venue?: string
        }
        Relationships: []
      }
      lost_and_found_items: {
        Row: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          item_type: string
          location: string
          marked_complete_at: string | null
          original_contact_email: string | null
          original_contact_name: string | null
          original_contact_phone: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          item_type: string
          location: string
          marked_complete_at?: string | null
          original_contact_email?: string | null
          original_contact_name?: string | null
          original_contact_phone?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string
          marked_complete_at?: string | null
          original_contact_email?: string | null
          original_contact_name?: string | null
          original_contact_phone?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lost_found_requests: {
        Row: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string | null
          date: string | null
          description: string | null
          file_name: string | null
          id: string
          image_url: string | null
          item_type: string
          location: string
          metadata: Json | null
          rejection_reason: string | null
          requester_email: string
          status: string | null
          storage_path: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          file_name?: string | null
          id?: string
          image_url?: string | null
          item_type: string
          location: string
          metadata?: Json | null
          rejection_reason?: string | null
          requester_email: string
          status?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          file_name?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string
          metadata?: Json | null
          rejection_reason?: string | null
          requester_email?: string
          status?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          branch: string
          created_at: string
          id: number
          pdf_url: string
          rating: number | null
          semester: string
          subject: string
          title: string
          updated_at: string
          upload_date: string
          uploaded_by: string
          user_id: string | null
          views: number
        }
        Insert: {
          branch: string
          created_at?: string
          id?: number
          pdf_url: string
          rating?: number | null
          semester: string
          subject: string
          title: string
          updated_at?: string
          upload_date?: string
          uploaded_by: string
          user_id?: string | null
          views?: number
        }
        Update: {
          branch?: string
          created_at?: string
          id?: number
          pdf_url?: string
          rating?: number | null
          semester?: string
          subject?: string
          title?: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string
          user_id?: string | null
          views?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          booking_details: Json | null
          created_at: string
          id: string
          payment_method: string | null
          payment_status: string
          service_name: string
          subservice_name: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_details?: Json | null
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          service_name: string
          subservice_name?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_details?: Json | null
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          service_name?: string
          subservice_name?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_acceptances: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          privacy_policy_accepted: boolean
          privacy_policy_version: string
          terms_conditions_accepted: boolean
          terms_conditions_version: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          privacy_policy_accepted?: boolean
          privacy_policy_version?: string
          terms_conditions_accepted?: boolean
          terms_conditions_version?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          privacy_policy_accepted?: boolean
          privacy_policy_version?: string
          terms_conditions_accepted?: boolean
          terms_conditions_version?: string
          user_id?: string
        }
        Relationships: []
      }
      ppts: {
        Row: {
          branch: string
          created_at: string | null
          id: number
          ppt_url: string
          rating: number | null
          semester: string
          subject: string
          title: string
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string
          user_id: string | null
          views: number | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          id?: number
          ppt_url: string
          rating?: number | null
          semester: string
          subject: string
          title: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by: string
          user_id?: string | null
          views?: number | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          id?: number
          ppt_url?: string
          rating?: number | null
          semester?: string
          subject?: string
          title?: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string
          user_id?: string | null
          views?: number | null
        }
        Relationships: []
      }
      print_helpers: {
        Row: {
          contact: string
          email: string | null
          id: string
          is_active: boolean
          joined_at: string
          last_active: string
          name: string
          total_earnings: number
          total_jobs: number
        }
        Insert: {
          contact: string
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          name: string
          total_earnings?: number
          total_jobs?: number
        }
        Update: {
          contact?: string
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          name?: string
          total_earnings?: number
          total_jobs?: number
        }
        Relationships: []
      }
      print_job_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          job_id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          job_id: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          job_id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_job_audit_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "print_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          accepted_at: string | null
          additional_notes: string | null
          binding_option: string | null
          copies: number
          created_at: string
          customer_completed: boolean | null
          delivered_at: string | null
          delivery_fee: number | null
          delivery_location: string
          delivery_time: string | null
          delivery_type: string | null
          file_deleted_at: string | null
          file_name: string
          file_size: number
          file_storage_path: string | null
          file_url: string
          helper_completed: boolean | null
          helper_fee: number
          helper_id: string | null
          id: string
          page_count: number
          paper_size: string
          print_type: string
          printed_at: string | null
          printing_cost: number
          privacy_acknowledged: boolean | null
          secure_download_token: string | null
          service_fee: number
          status: string
          student_contact: string
          student_name: string
          token_expires_at: string | null
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          additional_notes?: string | null
          binding_option?: string | null
          copies?: number
          created_at?: string
          customer_completed?: boolean | null
          delivered_at?: string | null
          delivery_fee?: number | null
          delivery_location: string
          delivery_time?: string | null
          delivery_type?: string | null
          file_deleted_at?: string | null
          file_name: string
          file_size: number
          file_storage_path?: string | null
          file_url: string
          helper_completed?: boolean | null
          helper_fee: number
          helper_id?: string | null
          id?: string
          page_count: number
          paper_size?: string
          print_type: string
          printed_at?: string | null
          printing_cost: number
          privacy_acknowledged?: boolean | null
          secure_download_token?: string | null
          service_fee: number
          status?: string
          student_contact: string
          student_name: string
          token_expires_at?: string | null
          total_cost: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          accepted_at?: string | null
          additional_notes?: string | null
          binding_option?: string | null
          copies?: number
          created_at?: string
          customer_completed?: boolean | null
          delivered_at?: string | null
          delivery_fee?: number | null
          delivery_location?: string
          delivery_time?: string | null
          delivery_type?: string | null
          file_deleted_at?: string | null
          file_name?: string
          file_size?: number
          file_storage_path?: string | null
          file_url?: string
          helper_completed?: boolean | null
          helper_fee?: number
          helper_id?: string | null
          id?: string
          page_count?: number
          paper_size?: string
          print_type?: string
          printed_at?: string | null
          printing_cost?: number
          privacy_acknowledged?: boolean | null
          secure_download_token?: string | null
          service_fee?: number
          status?: string
          student_contact?: string
          student_name?: string
          token_expires_at?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean | null
          rating_avg: number | null
          role: string | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          rating_avg?: number | null
          role?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          rating_avg?: number | null
          role?: string | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_code_usage: {
        Row: {
          bakery_partner_id: string | null
          booking_id: string
          id: string
          promo_code: string
          used_at: string | null
          used_by_bakery: boolean | null
        }
        Insert: {
          bakery_partner_id?: string | null
          booking_id: string
          id?: string
          promo_code: string
          used_at?: string | null
          used_by_bakery?: boolean | null
        }
        Update: {
          bakery_partner_id?: string | null
          booking_id?: string
          id?: string
          promo_code?: string
          used_at?: string | null
          used_by_bakery?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_bakery_partner_id_fkey"
            columns: ["bakery_partner_id"]
            isOneToOne: false
            referencedRelation: "bakery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "celebration_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pyqs: {
        Row: {
          branch: string
          created_at: string
          id: number
          pdf_url: string
          semester: string
          subject: string
          title: string
          updated_at: string
          uploaded_by: string
          user_id: string | null
          views: number
          year: string
        }
        Insert: {
          branch: string
          created_at?: string
          id?: number
          pdf_url: string
          semester: string
          subject: string
          title: string
          updated_at?: string
          uploaded_by: string
          user_id?: string | null
          views?: number
          year: string
        }
        Update: {
          branch?: string
          created_at?: string
          id?: number
          pdf_url?: string
          semester?: string
          subject?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
          user_id?: string | null
          views?: number
          year?: string
        }
        Relationships: []
      }
      resale_admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          payload: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          listing_id: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_exchange_requests: {
        Row: {
          created_at: string | null
          id: string
          requester_id: string
          requester_listing_id: string
          status: string | null
          target_listing_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requester_id: string
          requester_listing_id: string
          status?: string | null
          target_listing_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requester_id?: string
          requester_listing_id?: string
          status?: string | null
          target_listing_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_exchange_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_exchange_requests_requester_listing_id_fkey"
            columns: ["requester_listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_exchange_requests_target_listing_id_fkey"
            columns: ["target_listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_favourites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_favourites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_favourites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_listing_images: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          listing_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          listing_id: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          listing_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_listings: {
        Row: {
          campus: number | null
          category: string
          condition: string
          created_at: string | null
          currency: string | null
          delivery_fee: number | null
          description: string
          exchange_with: Json | null
          id: string
          is_exchange: boolean | null
          pickup_option: string
          price: number
          seller_id: string
          status: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          campus?: number | null
          category: string
          condition: string
          created_at?: string | null
          currency?: string | null
          delivery_fee?: number | null
          description: string
          exchange_with?: Json | null
          id?: string
          is_exchange?: boolean | null
          pickup_option: string
          price: number
          seller_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          campus?: number | null
          category?: string
          condition?: string
          created_at?: string | null
          currency?: string | null
          delivery_fee?: number | null
          description?: string
          exchange_with?: Json | null
          id?: string
          is_exchange?: boolean | null
          pickup_option?: string
          price?: number
          seller_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_messages: {
        Row: {
          attachments: Json | null
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_text: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "resale_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
          target_id: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
          reviewee_id: string
          reviewer_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          reviewee_id?: string
          reviewer_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "resale_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_transaction_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_data: Json | null
          event_type: string
          id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_transaction_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_transaction_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "resale_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      resale_transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string | null
          escrow_status: string | null
          id: string
          listing_id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          escrow_status?: string | null
          id?: string
          listing_id: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          escrow_status?: string | null
          id?: string
          listing_id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resale_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_downloads_daily: {
        Row: {
          day: string
          downloads: number | null
          user_id: string
        }
        Insert: {
          day: string
          downloads?: number | null
          user_id: string
        }
        Update: {
          day?: string
          downloads?: number | null
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string | null
          data: Json
          id: string
          template: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string | null
          data: Json
          id?: string
          template: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string | null
          data?: Json
          id?: string
          template?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      semester_books: {
        Row: {
          author: string
          base_price: number
          book_name: string
          created_at: string
          demand_multiplier: number
          edition: string
          id: string
          publisher: string | null
          semester: number
          subject_category: string | null
          updated_at: string
        }
        Insert: {
          author: string
          base_price?: number
          book_name: string
          created_at?: string
          demand_multiplier?: number
          edition: string
          id?: string
          publisher?: string | null
          semester: number
          subject_category?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          base_price?: number
          book_name?: string
          created_at?: string
          demand_multiplier?: number
          edition?: string
          id?: string
          publisher?: string | null
          semester?: number
          subject_category?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      semester_combos: {
        Row: {
          book_ids: string[]
          combo_name: string
          combo_price: number
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          semester_number: number
          updated_at: string | null
        }
        Insert: {
          book_ids: string[]
          combo_name: string
          combo_price: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          semester_number: number
          updated_at?: string | null
        }
        Update: {
          book_ids?: string[]
          combo_name?: string
          combo_price?: number
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          semester_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      semesters: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          semester_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          semester_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          semester_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      service_visibility: {
        Row: {
          created_at: string
          replaced_text: string | null
          service_id: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          replaced_text?: string | null
          service_id: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          replaced_text?: string | null
          service_id?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          from_member_id: string
          group_id: string
          id: string
          is_settled: boolean
          settled_at: string | null
          to_member_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_member_id: string
          group_id: string
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          to_member_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_member_id?: string
          group_id?: string
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          to_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      shopkeeper_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      lost_and_found_items_public: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string | null
          image_url: string | null
          item_type: string | null
          location: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contact_email?: never
          contact_name?: never
          contact_phone?: never
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          item_type?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contact_email?: never
          contact_name?: never
          contact_phone?: never
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          item_type?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      print_helpers_public: {
        Row: {
          contact: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          joined_at: string | null
          last_active: string | null
          name: string | null
          total_earnings: string | null
          total_jobs: string | null
        }
        Insert: {
          contact?: never
          email?: never
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          name?: string | null
          total_earnings?: never
          total_jobs?: never
        }
        Update: {
          contact?: never
          email?: never
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          name?: string | null
          total_earnings?: never
          total_jobs?: never
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_group_balances: {
        Args: { _group_id: string }
        Returns: {
          member_email: string
          member_id: string
          member_name: string
          net_balance: number
          total_paid: number
          total_share: number
        }[]
      }
      create_print_job_notification: {
        Args: {
          p_job_id: string
          p_message: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      delete_all_resume_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      export_group_summary: {
        Args: { _group_id: string }
        Returns: Json
      }
      generate_promo_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_lost_item_contact_details: {
        Args: { item_id: string }
        Returns: {
          contact_email: string
          contact_name: string
          contact_phone: string
        }[]
      }
      get_lost_item_contact_info: {
        Args: { item_id: string }
        Returns: {
          contact_email: string
          contact_name: string
          contact_phone: string
        }[]
      }
      handle_db_error: {
        Args: { error_message: string }
        Returns: Json
      }
      is_admin_user: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_group_creator: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      log_auth_attempt: {
        Args: { attempt_type: string; email_address: string }
        Returns: undefined
      }
      log_failed_query: {
        Args: { error_details: string; query_type: string }
        Returns: undefined
      }
      mark_lost_found_complete: {
        Args: { item_id: string }
        Returns: boolean
      }
      safe_table_query: {
        Args: { query_filters?: Json; table_name: string }
        Returns: Json
      }
      simplify_group_debts: {
        Args: { _group_id: string }
        Returns: {
          amount: number
          from_member_id: string
          from_member_name: string
          to_member_id: string
          to_member_name: string
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
