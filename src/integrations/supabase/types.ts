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
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          female_user_id: string
          id: string
          is_premium: boolean | null
          location: string | null
          male_user_id: string
          match_request_id: string | null
          review_deadline: string | null
          selected_rate_id: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          female_user_id: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          male_user_id: string
          match_request_id?: string | null
          review_deadline?: string | null
          selected_rate_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          female_user_id?: string
          id?: string
          is_premium?: boolean | null
          location?: string | null
          male_user_id?: string
          match_request_id?: string | null
          review_deadline?: string | null
          selected_rate_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_selected_rate_id_fkey"
            columns: ["selected_rate_id"]
            isOneToOne: false
            referencedRelation: "premium_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          match_request_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_request_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_request_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reviews: {
        Row: {
          action_taken: string | null
          admin_notes: string | null
          created_at: string
          id: string
          match_request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          action_taken?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          action_taken?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          match_request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reviews_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: true
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          favorite_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      match_requests: {
        Row: {
          appointment_deadline: string | null
          chat_status: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_premium: boolean | null
          message: string | null
          receiver_id: string
          selected_rate_id: string | null
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_deadline?: string | null
          chat_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          message?: string | null
          receiver_id: string
          selected_rate_id?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_deadline?: string | null
          chat_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          message?: string | null
          receiver_id?: string
          selected_rate_id?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_match_requests_receiver"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_match_requests_selected_rate"
            columns: ["selected_rate_id"]
            isOneToOne: false
            referencedRelation: "premium_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_match_requests_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_selected_rate_id_fkey"
            columns: ["selected_rate_id"]
            isOneToOne: false
            referencedRelation: "premium_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_rates: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number
          id: string
          price_euros: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours: number
          id?: string
          price_euros: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number
          id?: string
          price_euros?: number
          user_id?: string
        }
        Relationships: []
      }
      profile_photo_verifications: {
        Row: {
          admin_archived: boolean | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          photo_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Insert: {
          admin_archived?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Update: {
          admin_archived?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          birth_date: string
          created_at: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_blocked: boolean | null
          is_premium: boolean | null
          is_verified: Database["public"]["Enums"]["verification_status"] | null
          location_city: string
          location_lat: number | null
          location_lon: number | null
          max_age_preference: number | null
          min_age_preference: number | null
          negative_reviews_count: number | null
          photo_verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          positive_reviews_count: number | null
          profile_photo_url: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          birth_date: string
          created_at?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_blocked?: boolean | null
          is_premium?: boolean | null
          is_verified?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          location_city: string
          location_lat?: number | null
          location_lon?: number | null
          max_age_preference?: number | null
          min_age_preference?: number | null
          negative_reviews_count?: number | null
          photo_verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          positive_reviews_count?: number | null
          profile_photo_url?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string
          created_at?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_blocked?: boolean | null
          is_premium?: boolean | null
          is_verified?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          location_city?: string
          location_lat?: number | null
          location_lon?: number | null
          max_age_preference?: number | null
          min_age_preference?: number | null
          negative_reviews_count?: number | null
          photo_verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          positive_reviews_count?: number | null
          profile_photo_url?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_notes: string | null
          admin_status: string | null
          appointment_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          report_reason: string | null
          reported: boolean | null
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_status?: string | null
          appointment_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          report_reason?: string | null
          reported?: boolean | null
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_status?: string | null
          appointment_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          report_reason?: string | null
          reported?: boolean | null
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          amount: number
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_archived: boolean | null
          created_at: string | null
          document_url: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Insert: {
          admin_archived?: boolean | null
          created_at?: string | null
          document_url: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Update: {
          admin_archived?: boolean | null
          created_at?: string | null
          document_url?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalculate_all_review_counts: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      appointment_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "no_show_female"
        | "no_show_male"
        | "reported"
      gender: "male" | "female"
      verification_status: "pending" | "verified" | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      appointment_status: [
        "scheduled",
        "completed",
        "cancelled",
        "no_show_female",
        "no_show_male",
        "reported",
      ],
      gender: ["male", "female"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
