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
      admission_enquiries: {
        Row: {
          academic_year_id: string | null
          applicant_name: string
          applying_grade: string
          created_at: string
          email: string
          enquiry_no: string
          follow_up_date: string | null
          id: string
          notes: string
          parent_name: string
          phone: string
          school_id: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          applicant_name: string
          applying_grade: string
          created_at?: string
          email?: string
          enquiry_no: string
          follow_up_date?: string | null
          id?: string
          notes?: string
          parent_name: string
          phone: string
          school_id: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          applicant_name?: string
          applying_grade?: string
          created_at?: string
          email?: string
          enquiry_no?: string
          follow_up_date?: string | null
          id?: string
          notes?: string
          parent_name?: string
          phone?: string
          school_id?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_enquiries_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_enquiries_school_id_fkey"
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
      auth_rate_limits: {
        Row: {
          attempts: number
          bucket_key: string
          first_attempt_at: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          bucket_key: string
          first_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          bucket_key?: string
          first_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bulk_import_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          created_count: number
          entity_type: string
          error_count: number
          file_name: string
          id: string
          idempotency_hash: string
          row_errors: Json
          school_id: string
          status: string
          total_rows: number
          updated_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_count?: number
          entity_type: string
          error_count?: number
          file_name: string
          id?: string
          idempotency_hash: string
          row_errors?: Json
          school_id: string
          status?: string
          total_rows?: number
          updated_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_count?: number
          entity_type?: string
          error_count?: number
          file_name?: string
          id?: string
          idempotency_hash?: string
          row_errors?: Json
          school_id?: string
          status?: string
          total_rows?: number
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_import_jobs_school_id_fkey"
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
      guardians: {
        Row: {
          address: string
          consent_medical: boolean
          consent_photos: boolean
          consent_sms: boolean
          consent_whatsapp: boolean
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          occupation: string
          phone: string
          profile_id: string | null
          relation: string
          school_id: string
          updated_at: string
        }
        Insert: {
          address?: string
          consent_medical?: boolean
          consent_photos?: boolean
          consent_sms?: boolean
          consent_whatsapp?: boolean
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name: string
          id?: string
          occupation?: string
          phone?: string
          profile_id?: string | null
          relation?: string
          school_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          consent_medical?: boolean
          consent_photos?: boolean
          consent_sms?: boolean
          consent_whatsapp?: boolean
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          occupation?: string
          phone?: string
          profile_id?: string | null
          relation?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          is_primary: boolean
          school_id: string
          sibling_group_key: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          is_primary?: boolean
          school_id: string
          sibling_group_key?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          is_primary?: boolean
          school_id?: string
          sibling_group_key?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_slips: {
        Row: {
          created_at: string
          deductions_inr: number
          gross_inr: number
          id: string
          month_label: string
          net_inr: number
          paid_at: string | null
          school_id: string
          staff_id: string
          status: string
        }
        Insert: {
          created_at?: string
          deductions_inr?: number
          gross_inr?: number
          id?: string
          month_label: string
          net_inr?: number
          paid_at?: string | null
          school_id: string
          staff_id: string
          status?: string
        }
        Update: {
          created_at?: string
          deductions_inr?: number
          gross_inr?: number
          id?: string
          month_label?: string
          net_inr?: number
          paid_at?: string | null
          school_id?: string
          staff_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_slips_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_slips_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_announcements: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          published_at: string
          severity: string
          target_status: string[]
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          published_at?: string
          severity?: string
          target_status?: string[]
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          published_at?: string
          severity?: string
          target_status?: string[]
          title?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          company_address: string
          company_name: string
          default_grace_days: number
          default_gst_pct: number
          default_trial_days: number
          gstin: string
          owner_name: string
          platform_name: string
          singleton_key: string
          support_email: string
          updated_at: string
        }
        Insert: {
          company_address?: string
          company_name?: string
          default_grace_days?: number
          default_gst_pct?: number
          default_trial_days?: number
          gstin?: string
          owner_name?: string
          platform_name?: string
          singleton_key?: string
          support_email?: string
          updated_at?: string
        }
        Update: {
          company_address?: string
          company_name?: string
          default_grace_days?: number
          default_gst_pct?: number
          default_trial_days?: number
          gstin?: string
          owner_name?: string
          platform_name?: string
          singleton_key?: string
          support_email?: string
          updated_at?: string
        }
        Relationships: []
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
      saas_coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          redemption_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
        }
        Relationships: []
      }
      saas_credit_notes: {
        Row: {
          amount_inr: number
          created_at: string
          credit_note_number: string
          financial_year: string
          id: string
          invoice_id: string
          issued_at: string
          reason: string
          school_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          credit_note_number: string
          financial_year: string
          id?: string
          invoice_id: string
          issued_at?: string
          reason: string
          school_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          credit_note_number?: string
          financial_year?: string
          id?: string
          invoice_id?: string
          issued_at?: string
          reason?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "saas_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_credit_notes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_invoice_sequences: {
        Row: {
          financial_year: string
          last_number: number
        }
        Insert: {
          financial_year: string
          last_number?: number
        }
        Update: {
          financial_year?: string
          last_number?: number
        }
        Relationships: []
      }
      saas_invoices: {
        Row: {
          amount_paid_inr: number
          created_at: string
          discount_inr: number
          due_date: string
          financial_year: string
          gst_amount_inr: number
          gst_pct: number
          id: string
          invoice_number: string
          issued_at: string
          line_items: Json
          notes: string
          school_id: string
          status: string
          subscription_id: string | null
          subtotal_inr: number
          total_inr: number
        }
        Insert: {
          amount_paid_inr?: number
          created_at?: string
          discount_inr?: number
          due_date?: string
          financial_year: string
          gst_amount_inr?: number
          gst_pct?: number
          id?: string
          invoice_number: string
          issued_at?: string
          line_items?: Json
          notes?: string
          school_id: string
          status?: string
          subscription_id?: string | null
          subtotal_inr?: number
          total_inr?: number
        }
        Update: {
          amount_paid_inr?: number
          created_at?: string
          discount_inr?: number
          due_date?: string
          financial_year?: string
          gst_amount_inr?: number
          gst_pct?: number
          id?: string
          invoice_number?: string
          issued_at?: string
          line_items?: Json
          notes?: string
          school_id?: string
          status?: string
          subscription_id?: string | null
          subtotal_inr?: number
          total_inr?: number
        }
        Relationships: [
          {
            foreignKeyName: "saas_invoices_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "school_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_notification_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          recipient_email: string
          school_id: string
          status: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          recipient_email: string
          school_id: string
          status?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          recipient_email?: string
          school_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_notification_log_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_payments: {
        Row: {
          amount_inr: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          notes: string
          paid_at: string
          recorded_by: string | null
          reference_no: string
          school_id: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          id?: string
          invoice_id: string
          method: string
          notes?: string
          paid_at?: string
          recorded_by?: string | null
          reference_no: string
          school_id: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string
          paid_at?: string
          recorded_by?: string | null
          reference_no?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "saas_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_plans: {
        Row: {
          code: string
          created_at: string
          description: string
          enabled_modules: string[]
          gst_pct: number
          id: string
          is_active: boolean
          max_staff: number
          max_storage_mb: number
          max_students: number
          max_teachers: number
          name: string
          setup_fee_inr: number
          slabs: Json
          updated_at: string
          yearly_discount_pct: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          enabled_modules?: string[]
          gst_pct?: number
          id?: string
          is_active?: boolean
          max_staff?: number
          max_storage_mb?: number
          max_students?: number
          max_teachers?: number
          name: string
          setup_fee_inr?: number
          slabs?: Json
          updated_at?: string
          yearly_discount_pct?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          enabled_modules?: string[]
          gst_pct?: number
          id?: string
          is_active?: boolean
          max_staff?: number
          max_storage_mb?: number
          max_students?: number
          max_teachers?: number
          name?: string
          setup_fee_inr?: number
          slabs?: Json
          updated_at?: string
          yearly_discount_pct?: number
        }
        Relationships: []
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
      school_holidays: {
        Row: {
          category: string
          created_at: string
          holiday_date: string
          id: string
          school_id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          holiday_date: string
          id?: string
          school_id: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          holiday_date?: string
          id?: string
          school_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_holidays_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_onboarding: {
        Row: {
          academic_year_done: boolean
          classes_sections_done: boolean
          completed_at: string | null
          fee_structure_done: boolean
          parents_invited_done: boolean
          profile_done: boolean
          school_id: string
          students_imported_done: boolean
          subjects_done: boolean
          teachers_imported_done: boolean
          updated_at: string
        }
        Insert: {
          academic_year_done?: boolean
          classes_sections_done?: boolean
          completed_at?: string | null
          fee_structure_done?: boolean
          parents_invited_done?: boolean
          profile_done?: boolean
          school_id: string
          students_imported_done?: boolean
          subjects_done?: boolean
          teachers_imported_done?: boolean
          updated_at?: string
        }
        Update: {
          academic_year_done?: boolean
          classes_sections_done?: boolean
          completed_at?: string | null
          fee_structure_done?: boolean
          parents_invited_done?: boolean
          profile_done?: boolean
          school_id?: string
          students_imported_done?: boolean
          subjects_done?: boolean
          teachers_imported_done?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_onboarding_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_sections: {
        Row: {
          academic_year_id: string
          capacity: number
          class_id: string
          class_teacher_id: string | null
          created_at: string
          id: string
          room_no: string
          school_id: string
          section_name: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          capacity?: number
          class_id: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          room_no?: string
          school_id: string
          section_name: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          capacity?: number
          class_id?: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          room_no?: string
          school_id?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_sections_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_sections_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_sections_school_id_fkey"
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
      school_subscriptions: {
        Row: {
          billing_cycle: string
          coupon_id: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          custom_limits: Json | null
          grace_ends_at: string | null
          id: string
          monthly_rate_inr: number
          plan_id: string
          school_id: string
          status: string
          student_count_tier: number
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          custom_limits?: Json | null
          grace_ends_at?: string | null
          id?: string
          monthly_rate_inr?: number
          plan_id: string
          school_id: string
          status?: string
          student_count_tier?: number
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          coupon_id?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          custom_limits?: Json | null
          grace_ends_at?: string | null
          id?: string
          monthly_rate_inr?: number
          plan_id?: string
          school_id?: string
          status?: string
          student_count_tier?: number
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_subscriptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "saas_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
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
      staff_leave_requests: {
        Row: {
          created_at: string
          days_count: number
          from_date: string
          id: string
          leave_type: string
          reason: string
          reviewed_by: string | null
          school_id: string
          staff_id: string
          status: string
          to_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_count?: number
          from_date: string
          id?: string
          leave_type?: string
          reason: string
          reviewed_by?: string | null
          school_id: string
          staff_id: string
          status?: string
          to_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_count?: number
          from_date?: string
          id?: string
          leave_type?: string
          reason?: string
          reviewed_by?: string | null
          school_id?: string
          staff_id?: string
          status?: string
          to_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          allowances_inr: number
          base_salary_inr: number
          category: string
          created_at: string
          deductions_inr: number
          deleted_at: string | null
          department: string
          designation: string
          email: string
          employee_code: string
          experience_years: number
          full_name: string
          id: string
          joining_date: string
          leave_balance_days: number
          phone: string
          profile_id: string | null
          qualification: string
          school_id: string
          status: string
          sub_role: string | null
          updated_at: string
        }
        Insert: {
          allowances_inr?: number
          base_salary_inr?: number
          category?: string
          created_at?: string
          deductions_inr?: number
          deleted_at?: string | null
          department?: string
          designation?: string
          email?: string
          employee_code: string
          experience_years?: number
          full_name: string
          id?: string
          joining_date?: string
          leave_balance_days?: number
          phone?: string
          profile_id?: string | null
          qualification?: string
          school_id: string
          status?: string
          sub_role?: string | null
          updated_at?: string
        }
        Update: {
          allowances_inr?: number
          base_salary_inr?: number
          category?: string
          created_at?: string
          deductions_inr?: number
          deleted_at?: string | null
          department?: string
          designation?: string
          email?: string
          employee_code?: string
          experience_years?: number
          full_name?: string
          id?: string
          joining_date?: string
          leave_balance_days?: number
          phone?: string
          profile_id?: string | null
          qualification?: string
          school_id?: string
          status?: string
          sub_role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          id: string
          school_id: string
          storage_path: string
          student_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          id?: string
          school_id: string
          storage_path: string
          student_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          id?: string
          school_id?: string
          storage_path?: string
          student_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          academic_year_id: string
          carried_fee_balance_inr: number
          class_id: string | null
          created_at: string
          id: string
          is_read_only: boolean
          promotion_status: string
          roll_no: string
          school_id: string
          section_name: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          carried_fee_balance_inr?: number
          class_id?: string | null
          created_at?: string
          id?: string
          is_read_only?: boolean
          promotion_status?: string
          roll_no?: string
          school_id: string
          section_name?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          carried_fee_balance_inr?: number
          class_id?: string | null
          created_at?: string
          id?: string
          is_read_only?: boolean
          promotion_status?: string
          roll_no?: string
          school_id?: string
          section_name?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_remarks: {
        Row: {
          author_name: string
          category: string
          created_at: string
          id: string
          note: string
          school_id: string
          student_id: string
        }
        Insert: {
          author_name: string
          category?: string
          created_at?: string
          id?: string
          note: string
          school_id: string
          student_id: string
        }
        Update: {
          author_name?: string
          category?: string
          created_at?: string
          id?: string
          note?: string
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_remarks_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_remarks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string | null
          address: string
          admission_date: string
          admission_no: string
          blood_group: string
          category: string
          class_id: string | null
          created_at: string
          deleted_at: string | null
          dob: string | null
          emergency_contact: string
          fee_balance_inr: number
          full_name: string
          gender: string
          id: string
          medical_notes: string
          photo_path: string | null
          previous_school: string
          profile_id: string | null
          roll_no: string
          school_id: string
          section_name: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          address?: string
          admission_date?: string
          admission_no: string
          blood_group?: string
          category?: string
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          dob?: string | null
          emergency_contact?: string
          fee_balance_inr?: number
          full_name: string
          gender?: string
          id?: string
          medical_notes?: string
          photo_path?: string | null
          previous_school?: string
          profile_id?: string | null
          roll_no?: string
          school_id: string
          section_name?: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          address?: string
          admission_date?: string
          admission_no?: string
          blood_group?: string
          category?: string
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          dob?: string | null
          emergency_contact?: string
          fee_balance_inr?: number
          full_name?: string
          gender?: string
          id?: string
          medical_notes?: string
          photo_path?: string | null
          previous_school?: string
          profile_id?: string | null
          roll_no?: string
          school_id?: string
          section_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
      support_tickets: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          priority: string
          resolution_notes: string
          school_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          priority?: string
          resolution_notes?: string
          school_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          priority?: string
          resolution_notes?: string
          school_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string | null
          class_id: string
          created_at: string
          id: string
          is_class_teacher: boolean
          periods_per_week: number
          school_id: string
          section_name: string
          subject_id: string | null
          teacher_id: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean
          periods_per_week?: number
          school_id: string
          section_name?: string
          subject_id?: string | null
          teacher_id: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean
          periods_per_week?: number
          school_id?: string
          section_name?: string
          subject_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_platform_dashboard_metrics: {
        Args: never
        Returns: {
          active_schools: number
          arr_inr: number
          mrr_inr: number
          renewals_due_30d: number
          suspended_schools: number
          total_real_schools: number
          total_real_students: number
          trial_schools: number
        }[]
      }
      get_school_usage_summary: {
        Args: { p_school_id: string }
        Returns: {
          max_staff: number
          max_storage_mb: number
          max_students: number
          max_teachers: number
          staff_count: number
          storage_bytes: number
          students_count: number
          teachers_count: number
          users_count: number
        }[]
      }
      get_tenant_rls_audit: {
        Args: never
        Returns: {
          has_school_scope: boolean
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      next_saas_credit_note_number: { Args: { p_fy: string }; Returns: string }
      next_saas_invoice_number: { Args: { p_fy: string }; Returns: string }
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
