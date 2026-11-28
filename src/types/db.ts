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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          end_date: string
          end_label: string
          id: string
          name: string
          school_id: string
          start_date: string
          start_label: string
          status: string
          students_count: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          end_date: string
          end_label: string
          id?: string
          name: string
          school_id: string
          start_date: string
          start_label: string
          status?: string
          students_count?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          end_label?: string
          id?: string
          name?: string
          school_id?: string
          start_date?: string
          start_label?: string
          status?: string
          students_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_label: string
          created_at: string
          id: string
          ip_address: string
          module: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          school_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_label: string
          created_at?: string
          id?: string
          ip_address?: string
          module: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          school_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_label?: string
          created_at?: string
          id?: string
          ip_address?: string
          module?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          school_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subject_mappings: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          id: string
          is_mandatory: boolean
          mapped: boolean
          periods_per_week: number
          school_id: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          mapped?: boolean
          periods_per_week?: number
          school_id: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          mapped?: boolean
          periods_per_week?: number
          school_id?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subject_mappings_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subject_mappings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subject_mappings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subject_mappings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          initials: string
          last_login_at: string | null
          must_change_password: boolean
          permission_role_id: string | null
          phone: string | null
          preferred_language: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          security_answer_hash: string | null
          security_question: string | null
          status: Database["public"]["Enums"]["account_status"]
          sub_role: string | null
          subtitle: string
          two_factor_enabled: boolean
          updated_at: string
          user_code: string | null
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          initials?: string
          last_login_at?: string | null
          must_change_password?: boolean
          permission_role_id?: string | null
          phone?: string | null
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id: string
          security_answer_hash?: string | null
          security_question?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          sub_role?: string | null
          subtitle?: string
          two_factor_enabled?: boolean
          updated_at?: string
          user_code?: string | null
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          initials?: string
          last_login_at?: string | null
          must_change_password?: boolean
          permission_role_id?: string | null
          phone?: string | null
          preferred_language?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          security_answer_hash?: string | null
          security_question?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          sub_role?: string | null
          subtitle?: string
          two_factor_enabled?: boolean
          updated_at?: string
          user_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_permission_role_id_fkey"
            columns: ["permission_role_id"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_export: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          role_id: string
          school_id: string
          updated_at: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_export?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          role_id: string
          school_id: string
          updated_at?: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_export?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          role_id?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rbac_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rbac_permissions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_roles: {
        Row: {
          created_at: string
          description: string
          id: string
          is_system: boolean
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rbac_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_classes: {
        Row: {
          capacity: number
          class_teachers: string
          code: string
          created_at: string
          deleted_at: string | null
          grade_order: number
          id: string
          name: string
          room_block: string
          school_id: string
          sections: string[]
          status: string
          strength: number
          updated_at: string
          wing: string
        }
        Insert: {
          capacity?: number
          class_teachers?: string
          code: string
          created_at?: string
          deleted_at?: string | null
          grade_order: number
          id?: string
          name: string
          room_block?: string
          school_id: string
          sections?: string[]
          status?: string
          strength?: number
          updated_at?: string
          wing: string
        }
        Update: {
          capacity?: number
          class_teachers?: string
          code?: string
          created_at?: string
          deleted_at?: string | null
          grade_order?: number
          id?: string
          name?: string
          room_block?: string
          school_id?: string
          sections?: string[]
          status?: string
          strength?: number
          updated_at?: string
          wing?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          address: string
          affiliation_code: string
          created_at: string
          grading_mode: string
          id: string
          logo_path: string | null
          official_email: string
          phone: string
          principal_name: string
          school_id: string
          school_name: string
          singleton_key: string
          timezone_currency: string
          updated_at: string
        }
        Insert: {
          address: string
          affiliation_code: string
          created_at?: string
          grading_mode: string
          id?: string
          logo_path?: string | null
          official_email: string
          phone: string
          principal_name: string
          school_id: string
          school_name: string
          singleton_key?: string
          timezone_currency: string
          updated_at?: string
        }
        Update: {
          address?: string
          affiliation_code?: string
          created_at?: string
          grading_mode?: string
          id?: string
          logo_path?: string | null
          official_email?: string
          phone?: string
          principal_name?: string
          school_id?: string
          school_name?: string
          singleton_key?: string
          timezone_currency?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          accent_color: string
          address: string
          board: string
          contact_email: string
          contact_phone: string
          created_at: string
          currency: string
          date_format: string
          deleted_at: string | null
          enabled_modules: string[]
          id: string
          is_demo: boolean
          logo_path: string | null
          name: string
          school_code: string
          status: string
          timezone: string
          updated_at: string
          working_days: string[]
        }
        Insert: {
          accent_color?: string
          address?: string
          board?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          currency?: string
          date_format?: string
          deleted_at?: string | null
          enabled_modules?: string[]
          id?: string
          is_demo?: boolean
          logo_path?: string | null
          name: string
          school_code: string
          status?: string
          timezone?: string
          updated_at?: string
          working_days?: string[]
        }
        Update: {
          accent_color?: string
          address?: string
          board?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          currency?: string
          date_format?: string
          deleted_at?: string | null
          enabled_modules?: string[]
          id?: string
          is_demo?: boolean
          logo_path?: string | null
          name?: string
          school_code?: string
          status?: string
          timezone?: string
          updated_at?: string
          working_days?: string[]
        }
        Relationships: []
      }
      subjects: {
        Row: {
          category: string
          code: string
          created_at: string
          deleted_at: string | null
          id: string
          max_practical: number
          max_theory: number
          name: string
          periods_per_week: number
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          max_practical?: number
          max_theory?: number
          name: string
          periods_per_week?: number
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          max_practical?: number
          max_theory?: number
          name?: string
          periods_per_week?: number
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          read_only: boolean
          reason: string
          school_id: string
          super_admin_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          expires_at: string
          id?: string
          read_only?: boolean
          reason: string
          school_id: string
          super_admin_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          read_only?: boolean
          reason?: string
          school_id?: string
          super_admin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tenant_rls_audit: {
        Args: never
        Returns: {
          has_school_scope: boolean
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
    }
    Enums: {
      account_status: "Active" | "Suspended"
      user_role:
        | "admin"
        | "teacher"
        | "student"
        | "parent"
        | "staff"
        | "super_admin"
        | "school_admin"
        | "principal"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["Active", "Suspended"],
      user_role: [
        "admin",
        "teacher",
        "student",
        "parent",
        "staff",
        "super_admin",
        "school_admin",
        "principal",
      ],
    },
  },
} as const
