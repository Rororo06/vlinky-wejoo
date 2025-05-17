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
      activity_logs: {
        Row: {
          created_at: string
          details: Json | null
          event: string
          id: string
          ip_address: string | null
          severity: string
          timestamp: string
          user_email: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event: string
          id?: string
          ip_address?: string | null
          severity?: string
          timestamp?: string
          user_email?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event?: string
          id?: string
          ip_address?: string | null
          severity?: string
          timestamp?: string
          user_email?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          flag: string
          id: string
          name: string
        }
        Insert: {
          flag: string
          id: string
          name: string
        }
        Update: {
          flag?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      creator_applications: {
        Row: {
          agreed_to_terms: boolean | null
          bio: string | null
          content_rights: string | null
          country: string
          created_at: string | null
          email: string
          follower_count: string | null
          has_agency: boolean | null
          id: string
          influencer_name: string
          intro_video_url: string | null
          is_available: boolean | null
          languages: string[] | null
          platforms: string[]
          price: number | null
          profile_image_url: string | null
          status: string | null
          turnaround_time: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agreed_to_terms?: boolean | null
          bio?: string | null
          content_rights?: string | null
          country: string
          created_at?: string | null
          email: string
          follower_count?: string | null
          has_agency?: boolean | null
          id?: string
          influencer_name: string
          intro_video_url?: string | null
          is_available?: boolean | null
          languages?: string[] | null
          platforms: string[]
          price?: number | null
          profile_image_url?: string | null
          status?: string | null
          turnaround_time?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agreed_to_terms?: boolean | null
          bio?: string | null
          content_rights?: string | null
          country?: string
          created_at?: string | null
          email?: string
          follower_count?: string | null
          has_agency?: boolean | null
          id?: string
          influencer_name?: string
          intro_video_url?: string | null
          is_available?: boolean | null
          languages?: string[] | null
          platforms?: string[]
          price?: number | null
          profile_image_url?: string | null
          status?: string | null
          turnaround_time?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          created_at: string | null
          creator_id: string
          current_month_earnings: number | null
          id: string
          next_payout_date: string | null
          pending_payout: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          current_month_earnings?: number | null
          id?: string
          next_payout_date?: string | null
          pending_payout?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          current_month_earnings?: number | null
          id?: string
          next_payout_date?: string | null
          pending_payout?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          creator_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      video_requests: {
        Row: {
          created_at: string | null
          creator_id: string
          deadline: string | null
          email: string | null
          fan_id: string | null
          fan_name: string
          id: string
          is_private: boolean | null
          order_type: string
          rating: number | null
          recipient_name: string | null
          request_details: string | null
          status: string
          total_price: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          deadline?: string | null
          email?: string | null
          fan_id?: string | null
          fan_name: string
          id?: string
          is_private?: boolean | null
          order_type: string
          rating?: number | null
          recipient_name?: string | null
          request_details?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          deadline?: string | null
          email?: string | null
          fan_id?: string | null
          fan_name?: string
          id?: string
          is_private?: boolean | null
          order_type?: string
          rating?: number | null
          recipient_name?: string | null
          request_details?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      video_uploads: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          metadata: Json | null
          status: string
          title: string
          video_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          metadata?: Json | null
          status?: string
          title: string
          video_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          metadata?: Json | null
          status?: string
          title?: string
          video_id?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      fan_videos: {
        Row: {
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          fan_id: string | null
          id: string | null
          recipient_name: string | null
          request_details: string | null
          status: string | null
          updated_at: string | null
          video_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      enable_realtime: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_activity: {
        Args: {
          event_name: string
          user_email: string
          ip_address: string
          severity?: string
          details?: Json
        }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
