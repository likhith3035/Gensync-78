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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          item_id: string | null
          item_title: string | null
          item_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_title?: string | null
          item_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_title?: string | null
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_tips: {
        Row: {
          category: string
          created_at: string
          created_by: string
          display_order: number
          emoji: string
          id: string
          is_active: boolean
          text: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          display_order?: number
          emoji?: string
          id?: string
          is_active?: boolean
          text: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          display_order?: number
          emoji?: string
          id?: string
          is_active?: boolean
          text?: string
          title?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          category: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          organization: string
          privacy_type: string
          allowed_emails: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization: string
          privacy_type?: string
          allowed_emails?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization?: string
          privacy_type?: string
          allowed_emails?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      point_rules: {
        Row: {
          action_type: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          points: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          action_type: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          points?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          action_type?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          points?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          skills: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          tags: string[] | null
          privacy_type: string
          allowed_emails: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          privacy_type?: string
          allowed_emails?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          privacy_type?: string
          allowed_emails?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          course_code: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          privacy_type: string
          allowed_emails: string[]
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          course_code?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          privacy_type?: string
          allowed_emails?: string[]
          subject: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          course_code?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          privacy_type?: string
          allowed_emails?: string[]
          subject?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      shares: {
        Row: {
          access_code: string | null
          access_method: string
          content_type: string | null
          created_at: string
          custom_content: string | null
          custom_links: string[] | null
          custom_message: string | null
          custom_title: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          privacy_type: string
          allowed_emails: string[]
          reference_id: string | null
          share_token: string
          share_type: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          access_code?: string | null
          access_method?: string
          content_type?: string | null
          created_at?: string
          custom_content?: string | null
          custom_links?: string[] | null
          custom_message?: string | null
          custom_title?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          privacy_type?: string
          allowed_emails?: string[]
          reference_id?: string | null
          share_token?: string
          share_type: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          access_code?: string | null
          access_method?: string
          content_type?: string | null
          created_at?: string
          custom_content?: string | null
          custom_links?: string[] | null
          custom_message?: string | null
          custom_title?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          privacy_type?: string
          allowed_emails?: string[]
          reference_id?: string | null
          share_token?: string
          share_type?: string
          updated_at?: string
          user_id?: string
          view_count?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_share_by_code: {
        Args: { p_code: string }
        Returns: {
          access_code: string | null
          access_method: string
          content_type: string | null
          created_at: string
          custom_content: string | null
          custom_links: string[] | null
          custom_message: string | null
          custom_title: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          reference_id: string | null
          share_token: string
          share_type: string
          updated_at: string
          user_id: string
          view_count: number
        }[]
        SetofOptions: {
          from: "*"
          to: "shares"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_share_by_token: {
        Args: { p_token: string }
        Returns: {
          access_code: string | null
          access_method: string
          content_type: string | null
          created_at: string
          custom_content: string | null
          custom_links: string[] | null
          custom_message: string | null
          custom_title: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          reference_id: string | null
          share_token: string
          share_type: string
          updated_at: string
          user_id: string
          view_count: number
        }[]
        SetofOptions: {
          from: "*"
          to: "shares"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_share_views: {
        Args: { p_share_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
