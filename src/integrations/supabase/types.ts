export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          name: string;
          platform_id: string;
          scopes: string[] | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          name: string;
          platform_id: string;
          scopes?: string[] | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          name?: string;
          platform_id?: string;
          scopes?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "api_keys_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
          new_data: Json | null;
          old_data: Json | null;
          platform_id: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          platform_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          platform_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_requests: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
          phone: string | null;
          request_type: string;
          status: string | null;
          vertical: string | null;
          volume: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          phone?: string | null;
          request_type?: string;
          status?: string | null;
          vertical?: string | null;
          volume?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string | null;
          request_type?: string;
          status?: string | null;
          vertical?: string | null;
          volume?: string | null;
        };
        Relationships: [];
      };
      end_user_profiles: {
        Row: {
          address: Json | null;
          business_name: string;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          external_id: string | null;
          id: string;
          metadata: Json | null;
          platform_id: string;
          public_badge_id: string | null;
          status: string;
          trust_score: number | null;
          updated_at: string;
        };
        Insert: {
          address?: Json | null;
          business_name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          external_id?: string | null;
          id?: string;
          metadata?: Json | null;
          platform_id: string;
          public_badge_id?: string | null;
          status?: string;
          trust_score?: number | null;
          updated_at?: string;
        };
        Update: {
          address?: Json | null;
          business_name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          external_id?: string | null;
          id?: string;
          metadata?: Json | null;
          platform_id?: string;
          public_badge_id?: string | null;
          status?: string;
          trust_score?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "end_user_profiles_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      evidences: {
        Row: {
          ai_analysis: Json | null;
          created_at: string;
          document_name: string;
          document_type: string;
          expires_at: string | null;
          extraction_confidence: number | null;
          file_path: string;
          file_size: number | null;
          flags: string[] | null;
          id: string;
          issued_at: string | null;
          metadata: Json | null;
          mime_type: string | null;
          ocr_data: Json | null;
          platform_id: string;
          profile_id: string;
          rejection_reason: string | null;
          request_id: string | null;
          review_status: string | null;
          reviewed_at: string | null;
          reviewer_id: string | null;
          rules_item_id: string | null;
          status: Database["public"]["Enums"]["evidence_status"];
          updated_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          ai_analysis?: Json | null;
          created_at?: string;
          document_name: string;
          document_type: string;
          expires_at?: string | null;
          extraction_confidence?: number | null;
          file_path: string;
          file_size?: number | null;
          flags?: string[] | null;
          id?: string;
          issued_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          ocr_data?: Json | null;
          platform_id: string;
          profile_id: string;
          rejection_reason?: string | null;
          request_id?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          rules_item_id?: string | null;
          status?: Database["public"]["Enums"]["evidence_status"];
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          ai_analysis?: Json | null;
          created_at?: string;
          document_name?: string;
          document_type?: string;
          expires_at?: string | null;
          extraction_confidence?: number | null;
          file_path?: string;
          file_size?: number | null;
          flags?: string[] | null;
          id?: string;
          issued_at?: string | null;
          metadata?: Json | null;
          mime_type?: string | null;
          ocr_data?: Json | null;
          platform_id?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          request_id?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          rules_item_id?: string | null;
          status?: Database["public"]["Enums"]["evidence_status"];
          updated_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "evidences_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidences_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "end_user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidences_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "verification_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidences_rules_item_id_fkey";
            columns: ["rules_item_id"];
            isOneToOne: false;
            referencedRelation: "rules_items";
            referencedColumns: ["id"];
          },
        ];
      };
      expiry_queue: {
        Row: {
          created_at: string;
          current_stage: string | null;
          end_user_id: string;
          evidence_id: string;
          expires_at: string;
          id: string;
          is_required: boolean | null;
          last_notified_at: string | null;
          next_reminder_at: string | null;
          platform_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_stage?: string | null;
          end_user_id: string;
          evidence_id: string;
          expires_at: string;
          id?: string;
          is_required?: boolean | null;
          last_notified_at?: string | null;
          next_reminder_at?: string | null;
          platform_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_stage?: string | null;
          end_user_id?: string;
          evidence_id?: string;
          expires_at?: string;
          id?: string;
          is_required?: boolean | null;
          last_notified_at?: string | null;
          next_reminder_at?: string | null;
          platform_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expiry_queue_end_user_id_fkey";
            columns: ["end_user_id"];
            isOneToOne: false;
            referencedRelation: "end_user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expiry_queue_evidence_id_fkey";
            columns: ["evidence_id"];
            isOneToOne: false;
            referencedRelation: "evidences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expiry_queue_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      magic_links: {
        Row: {
          created_at: string;
          created_by: string | null;
          end_user_id: string;
          expires_at: string;
          id: string;
          platform_id: string;
          revoked_at: string | null;
          token_hash: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          end_user_id: string;
          expires_at: string;
          id?: string;
          platform_id: string;
          revoked_at?: string | null;
          token_hash: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          end_user_id?: string;
          expires_at?: string;
          id?: string;
          platform_id?: string;
          revoked_at?: string | null;
          token_hash?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "magic_links_end_user_id_fkey";
            columns: ["end_user_id"];
            isOneToOne: false;
            referencedRelation: "end_user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "magic_links_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications_queue: {
        Row: {
          body: string | null;
          created_at: string;
          end_user_id: string | null;
          error_message: string | null;
          evidence_id: string | null;
          id: string;
          metadata: Json | null;
          notification_type: string;
          platform_id: string;
          recipient_email: string | null;
          recipient_phone: string | null;
          sent_at: string | null;
          status: string;
          subject: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          end_user_id?: string | null;
          error_message?: string | null;
          evidence_id?: string | null;
          id?: string;
          metadata?: Json | null;
          notification_type: string;
          platform_id: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          end_user_id?: string | null;
          error_message?: string | null;
          evidence_id?: string | null;
          id?: string;
          metadata?: Json | null;
          notification_type?: string;
          platform_id?: string;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_queue_end_user_id_fkey";
            columns: ["end_user_id"];
            isOneToOne: false;
            referencedRelation: "end_user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_queue_evidence_id_fkey";
            columns: ["evidence_id"];
            isOneToOne: false;
            referencedRelation: "evidences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_queue_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      platforms: {
        Row: {
          created_at: string;
          id: string;
          logo_url: string | null;
          name: string;
          primary_color: string | null;
          settings: Json | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          primary_color?: string | null;
          settings?: Json | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          primary_color?: string | null;
          settings?: Json | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_decisions: {
        Row: {
          checklist: Json | null;
          created_at: string;
          decision: string;
          id: string;
          notes: string | null;
          request_id: string;
          reviewer_id: string;
        };
        Insert: {
          checklist?: Json | null;
          created_at?: string;
          decision: string;
          id?: string;
          notes?: string | null;
          request_id: string;
          reviewer_id: string;
        };
        Update: {
          checklist?: Json | null;
          created_at?: string;
          decision?: string;
          id?: string;
          notes?: string | null;
          request_id?: string;
          reviewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_decisions_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "verification_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      rules_items: {
        Row: {
          created_at: string;
          description: string | null;
          document_type: string;
          expiration_days: number | null;
          id: string;
          is_required: boolean | null;
          name: string;
          package_id: string;
          score_weight: number | null;
          validation_rules: Json | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          document_type: string;
          expiration_days?: number | null;
          id?: string;
          is_required?: boolean | null;
          name: string;
          package_id: string;
          score_weight?: number | null;
          validation_rules?: Json | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          document_type?: string;
          expiration_days?: number | null;
          id?: string;
          is_required?: boolean | null;
          name?: string;
          package_id?: string;
          score_weight?: number | null;
          validation_rules?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "rules_items_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "rules_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      rules_packages: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_template: boolean | null;
          name: string;
          platform_id: string | null;
          scoring_config: Json | null;
          updated_at: string;
          validity_days: number | null;
          vertical: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_template?: boolean | null;
          name: string;
          platform_id?: string | null;
          scoring_config?: Json | null;
          updated_at?: string;
          validity_days?: number | null;
          vertical: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_template?: boolean | null;
          name?: string;
          platform_id?: string | null;
          scoring_config?: Json | null;
          updated_at?: string;
          validity_days?: number | null;
          vertical?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rules_packages_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_name: string;
          platform_id: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          verifications_included: number | null;
          verifications_used: number | null;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_name?: string;
          platform_id: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          verifications_included?: number | null;
          verifications_used?: number | null;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_name?: string;
          platform_id?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          verifications_included?: number | null;
          verifications_used?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json | null;
          platform_id: string;
          quantity: number | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          platform_id: string;
          quantity?: number | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          platform_id?: string;
          quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "usage_events_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          platform_id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          platform_id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          platform_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_requests: {
        Row: {
          assigned_to: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          metadata: Json | null;
          notes: string | null;
          package_id: string;
          platform_id: string;
          priority: number | null;
          profile_id: string;
          reviewed_at: string | null;
          sla_deadline: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          notes?: string | null;
          package_id: string;
          platform_id: string;
          priority?: number | null;
          profile_id: string;
          reviewed_at?: string | null;
          sla_deadline?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json | null;
          notes?: string | null;
          package_id?: string;
          platform_id?: string;
          priority?: number | null;
          profile_id?: string;
          reviewed_at?: string | null;
          sla_deadline?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_requests_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "rules_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_requests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "end_user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      webhooks: {
        Row: {
          created_at: string;
          events: string[];
          failure_count: number | null;
          id: string;
          is_active: boolean | null;
          last_triggered_at: string | null;
          platform_id: string;
          secret: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          events: string[];
          failure_count?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_triggered_at?: string | null;
          platform_id: string;
          secret: string;
          url: string;
        };
        Update: {
          created_at?: string;
          events?: string[];
          failure_count?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_triggered_at?: string | null;
          platform_id?: string;
          secret?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhooks_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_platforms: { Args: { _user_id: string }; Returns: string[] };
      has_platform_access: {
        Args: { _platform_id: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _platform_id: string;
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "platform_owner" | "platform_admin" | "reviewer" | "viewer";
      evidence_status: "pending" | "valid" | "expired" | "rejected";
      verification_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
        | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["platform_owner", "platform_admin", "reviewer", "viewer"],
      evidence_status: ["pending", "valid", "expired", "rejected"],
      verification_status: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "expired",
      ],
    },
  },
} as const;
