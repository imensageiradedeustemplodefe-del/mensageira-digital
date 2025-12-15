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
      custom_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          message: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      daily_verses: {
        Row: {
          book_name: string
          category: string | null
          chapter: number
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          verse_number: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          book_name: string
          category?: string | null
          chapter: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          verse_number: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          book_name?: string
          category?: string | null
          chapter?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          verse_number?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      encrypted_contacts: {
        Row: {
          created_at: string
          encrypted_email: string | null
          encrypted_phone: string | null
          encryption_key_hash: string
          id: string
          prayer_request_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_email?: string | null
          encrypted_phone?: string | null
          encryption_key_hash: string
          id?: string
          prayer_request_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_email?: string | null
          encrypted_phone?: string | null
          encryption_key_hash?: string
          id?: string
          prayer_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_encrypted_contacts_prayer_request"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_contacts: {
        Row: {
          contact_info: string
          created_at: string | null
          event_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          contact_info: string
          created_at?: string | null
          event_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          contact_info?: string
          created_at?: string | null
          event_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_contacts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registration_fields: {
        Row: {
          created_at: string
          event_id: string
          field_label: string
          field_name: string
          field_options: string[] | null
          field_order: number
          field_placeholder: string | null
          field_type: string
          id: string
          is_required: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          field_label: string
          field_name: string
          field_options?: string[] | null
          field_order?: number
          field_placeholder?: string | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          field_label?: string
          field_name?: string
          field_options?: string[] | null
          field_order?: number
          field_placeholder?: string | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registration_fields_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          registration_data: Json
          spreadsheet_id: string | null
          synced_at: string | null
          synced_to_sheets: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          registration_data: Json
          spreadsheet_id?: string | null
          synced_at?: string | null
          synced_to_sheets?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          registration_data?: Json
          spreadsheet_id?: string | null
          synced_at?: string | null
          synced_to_sheets?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          location: string | null
          name: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          location?: string | null
          name: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          location?: string | null
          name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          image_url: string | null
          is_published: boolean | null
          location: string | null
          max_participants: number | null
          registration_required: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_participants?: number | null
          registration_required?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          location?: string | null
          max_participants?: number | null
          registration_required?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_photo_url: string | null
          created_at: string
          description: string | null
          drive_folder_id: string | null
          event_date: string | null
          id: string
          is_published: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          drive_folder_id?: string | null
          event_date?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          drive_folder_id?: string | null
          event_date?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          album_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          image_url: string
          is_published: boolean | null
          participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          album_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          album_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_photos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_photos: {
        Row: {
          created_at: string
          drive_file_id: string
          drive_folder_id: string | null
          drive_modified_time: string | null
          gallery_photo_id: string | null
          id: string
          last_synced_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          drive_file_id: string
          drive_folder_id?: string | null
          drive_modified_time?: string | null
          gallery_photo_id?: string | null
          id?: string
          last_synced_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          drive_file_id?: string
          drive_folder_id?: string | null
          drive_modified_time?: string | null
          gallery_photo_id?: string | null
          id?: string
          last_synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_photos_gallery_photo_id_fkey"
            columns: ["gallery_photo_id"]
            isOneToOne: false
            referencedRelation: "gallery_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_settings: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          is_enabled: boolean | null
          last_sync_at: string | null
          sync_frequency: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          chat_enabled: boolean | null
          created_at: string
          description: string | null
          embed_url: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          is_live: boolean | null
          platform: string
          scheduled_at: string | null
          started_at: string | null
          stream_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewer_count: number | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_live?: boolean | null
          platform: string
          scheduled_at?: string | null
          started_at?: string | null
          stream_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewer_count?: number | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string
          description?: string | null
          embed_url?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          is_live?: boolean | null
          platform?: string
          scheduled_at?: string | null
          started_at?: string | null
          stream_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewer_count?: number | null
        }
        Relationships: []
      }
      media_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          artist: string | null
          category_id: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_published: boolean | null
          is_radio: boolean | null
          media_url: string
          play_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          is_radio?: boolean | null
          media_url: string
          play_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_published?: boolean | null
          is_radio?: boolean | null
          media_url?: string
          play_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "media_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_reactions: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          allow_public_share: boolean | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          has_contact_info: boolean | null
          id: string
          is_approved: boolean | null
          is_completed: boolean | null
          is_urgent: boolean | null
          name: string
          request_text: string
          updated_at: string
        }
        Insert: {
          allow_public_share?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          has_contact_info?: boolean | null
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          is_urgent?: boolean | null
          name: string
          request_text: string
          updated_at?: string
        }
        Update: {
          allow_public_share?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          has_contact_info?: boolean | null
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          is_urgent?: boolean | null
          name?: string
          request_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_prayer_requests: {
        Row: {
          category: string | null
          created_at: string
          display_name: string | null
          id: string
          is_urgent: boolean | null
          request_text: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_urgent?: boolean | null
          request_text: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_urgent?: boolean | null
          request_text?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      photo_reaction_counts: {
        Row: {
          photo_id: string | null
          reaction_count: number | null
          reaction_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_encrypted_contact: {
        Args: { p_prayer_request_id: string }
        Returns: {
          encrypted_email: string
          encrypted_phone: string
          encryption_key_hash: string
        }[]
      }
      get_public_church_info: {
        Args: never
        Returns: {
          category: string
          display_name: string
          setting_key: string
          setting_value: string
        }[]
      }
      get_public_prayer_requests: {
        Args: never
        Returns: {
          category: string
          created_at: string
          display_name: string
          id: string
          is_urgent: boolean
          request_text: string
        }[]
      }
      get_sanitized_prayer_requests: {
        Args: never
        Returns: {
          category: string
          created_at: string
          display_name: string
          id: string
          is_urgent: boolean
          request_text: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      notify_todays_events: { Args: never; Returns: undefined }
      sanitize_prayer_request_for_public: {
        Args: { p_email?: string; p_name: string; p_phone?: string }
        Returns: string
      }
      send_push_notification: {
        Args: {
          p_badge?: string
          p_body: string
          p_icon?: string
          p_title: string
          p_url?: string
        }
        Returns: undefined
      }
      store_encrypted_contact: {
        Args: {
          p_encrypted_email?: string
          p_encrypted_phone?: string
          p_key_hash?: string
          p_prayer_request_id: string
        }
        Returns: string
      }
      user_has_reacted: {
        Args: { p_photo_id: string; p_user_id: string }
        Returns: boolean
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
