export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_delete_tokens: {
        Row: {
          token: string
          user_id: string
        }
        Insert: {
          token?: string
          user_id: string
        }
        Update: {
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_delete_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: boolean
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: boolean
          settings?: Json
          updated_at?: string
        }
        Update: {
          id?: boolean
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      audio_concatenate: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_details: {
        Row: {
          avatar_id: string | null
          avatar_type: string | null
          created_at: string | null
          default_voice_id: string | null
          error_text: string | null
          external_id: string | null
          gender: string | null
          id: string
          is_public: boolean | null
          name: string | null
          premium: boolean | null
          preview_image_url: string | null
          preview_video_url: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_id?: string | null
          avatar_type?: string | null
          created_at?: string | null
          default_voice_id?: string | null
          error_text?: string | null
          external_id?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          premium?: boolean | null
          preview_image_url?: string | null
          preview_video_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string | null
          avatar_type?: string | null
          created_at?: string | null
          default_voice_id?: string | null
          error_text?: string | null
          external_id?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          premium?: boolean | null
          preview_image_url?: string | null
          preview_video_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_details_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: true
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_groups: {
        Row: {
          created_at: number | null
          default_voice_id: string | null
          group_type: string | null
          id: string
          name: string
          num_looks: number | null
          preview_image: string | null
          train_status: string | null
        }
        Insert: {
          created_at?: number | null
          default_voice_id?: string | null
          group_type?: string | null
          id: string
          name: string
          num_looks?: number | null
          preview_image?: string | null
          train_status?: string | null
        }
        Update: {
          created_at?: number | null
          default_voice_id?: string | null
          group_type?: string | null
          id?: string
          name?: string
          num_looks?: number | null
          preview_image?: string | null
          train_status?: string | null
        }
        Relationships: []
      }
      avatars: {
        Row: {
          avatar_id: string | null
          avatar_name: string | null
          default_voice_id: string | null
          gender: string | null
          id: string
          premium: boolean | null
          preview_image_url: string | null
          preview_video_url: string | null
          tags: string[] | null
          talking_photo_id: string | null
          talking_photo_name: string | null
          type: string | null
        }
        Insert: {
          avatar_id?: string | null
          avatar_name?: string | null
          default_voice_id?: string | null
          gender?: string | null
          id?: string
          premium?: boolean | null
          preview_image_url?: string | null
          preview_video_url?: string | null
          tags?: string[] | null
          talking_photo_id?: string | null
          talking_photo_name?: string | null
          type?: string | null
        }
        Update: {
          avatar_id?: string | null
          avatar_name?: string | null
          default_voice_id?: string | null
          gender?: string | null
          id?: string
          premium?: boolean | null
          preview_image_url?: string | null
          preview_video_url?: string | null
          tags?: string[] | null
          talking_photo_id?: string | null
          talking_photo_name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      avatars_in_one_group: {
        Row: {
          avatar_data: Json | null
          avatar_group_id: string | null
          created_at: string | null
          error_text: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_data?: Json | null
          avatar_group_id?: string | null
          created_at?: string | null
          error_text?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          avatar_data?: Json | null
          avatar_group_id?: string | null
          created_at?: string | null
          error_text?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatars_in_one_group_avatar_group_id_fkey"
            columns: ["avatar_group_id"]
            isOneToOne: true
            referencedRelation: "avatar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          billing_email: string
          default_currency: string | null
          gateway_customer_id: string
          gateway_name: string
          metadata: Json | null
          workspace_id: string
        }
        Insert: {
          billing_email: string
          default_currency?: string | null
          gateway_customer_id: string
          gateway_name: string
          metadata?: Json | null
          workspace_id: string
        }
        Update: {
          billing_email?: string
          default_currency?: string | null
          gateway_customer_id?: string
          gateway_name?: string
          metadata?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount: number
          currency: string
          due_date: string | null
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string | null
          gateway_product_id: string | null
          hosted_invoice_url: string | null
          paid_date: string | null
          status: string
        }
        Insert: {
          amount: number
          currency: string
          due_date?: string | null
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id?: string | null
          gateway_product_id?: string | null
          hosted_invoice_url?: string | null
          paid_date?: string | null
          status: string
        }
        Update: {
          amount?: number
          currency?: string
          due_date?: string | null
          gateway_customer_id?: string
          gateway_invoice_id?: string
          gateway_name?: string
          gateway_price_id?: string | null
          gateway_product_id?: string | null
          hosted_invoice_url?: string | null
          paid_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_invoices_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_invoices_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_one_time_payments: {
        Row: {
          amount: number
          charge_date: string
          currency: string
          gateway_charge_id: string
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          status: string
        }
        Insert: {
          amount: number
          charge_date: string
          currency: string
          gateway_charge_id: string
          gateway_customer_id: string
          gateway_invoice_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          status: string
        }
        Update: {
          amount?: number
          charge_date?: string
          currency?: string
          gateway_charge_id?: string
          gateway_customer_id?: string
          gateway_invoice_id?: string
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_one_time_payments_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_invoice_id_fkey"
            columns: ["gateway_invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["gateway_invoice_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_one_time_payments_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_payment_methods: {
        Row: {
          gateway_customer_id: string
          id: string
          is_default: boolean
          payment_method_details: Json
          payment_method_id: string
          payment_method_type: string
        }
        Insert: {
          gateway_customer_id: string
          id?: string
          is_default?: boolean
          payment_method_details: Json
          payment_method_id: string
          payment_method_type: string
        }
        Update: {
          gateway_customer_id?: string
          id?: string
          is_default?: boolean
          payment_method_details?: Json
          payment_method_id?: string
          payment_method_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_methods_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
        ]
      }
      billing_prices: {
        Row: {
          active: boolean
          amount: number
          currency: string
          free_trial_days: number | null
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          metadata: Json | null
          recurring_interval: string
          recurring_interval_count: number
          tier: string | null
        }
        Insert: {
          active?: boolean
          amount: number
          currency: string
          free_trial_days?: number | null
          gateway_name: string
          gateway_price_id?: string
          gateway_product_id: string
          metadata?: Json | null
          recurring_interval: string
          recurring_interval_count?: number
          tier?: string | null
        }
        Update: {
          active?: boolean
          amount?: number
          currency?: string
          free_trial_days?: number | null
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          metadata?: Json | null
          recurring_interval?: string
          recurring_interval_count?: number
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_prices_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_products: {
        Row: {
          active: boolean
          description: string | null
          features: Json | null
          gateway_name: string
          gateway_product_id: string
          is_visible_in_ui: boolean
          name: string
        }
        Insert: {
          active?: boolean
          description?: string | null
          features?: Json | null
          gateway_name: string
          gateway_product_id: string
          is_visible_in_ui?: boolean
          name: string
        }
        Update: {
          active?: boolean
          description?: string | null
          features?: Json | null
          gateway_name?: string
          gateway_product_id?: string
          is_visible_in_ui?: boolean
          name?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          currency: string
          current_period_end: string
          current_period_start: string
          gateway_customer_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          gateway_subscription_id: string
          id: string
          is_trial: boolean
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
        }
        Insert: {
          cancel_at_period_end: boolean
          currency: string
          current_period_end: string
          current_period_start: string
          gateway_customer_id: string
          gateway_name: string
          gateway_price_id: string
          gateway_product_id: string
          gateway_subscription_id: string
          id?: string
          is_trial: boolean
          quantity?: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          currency?: string
          current_period_end?: string
          current_period_start?: string
          gateway_customer_id?: string
          gateway_name?: string
          gateway_price_id?: string
          gateway_product_id?: string
          gateway_subscription_id?: string
          id?: string
          is_trial?: boolean
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
          {
            foreignKeyName: "billing_subscriptions_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
          {
            foreignKeyName: "billing_subscriptions_gateway_product_id_fkey"
            columns: ["gateway_product_id"]
            isOneToOne: false
            referencedRelation: "billing_products"
            referencedColumns: ["gateway_product_id"]
          },
        ]
      }
      billing_usage_logs: {
        Row: {
          feature: string
          gateway_customer_id: string
          id: string
          timestamp: string
          usage_amount: number
        }
        Insert: {
          feature: string
          gateway_customer_id: string
          id?: string
          timestamp?: string
          usage_amount: number
        }
        Update: {
          feature?: string
          gateway_customer_id?: string
          id?: string
          timestamp?: string
          usage_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_logs_gateway_customer_id_fkey"
            columns: ["gateway_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["gateway_customer_id"]
          },
        ]
      }
      billing_volume_tiers: {
        Row: {
          gateway_price_id: string
          id: string
          max_quantity: number | null
          min_quantity: number
          unit_price: number
        }
        Insert: {
          gateway_price_id: string
          id?: string
          max_quantity?: number | null
          min_quantity: number
          unit_price: number
        }
        Update: {
          gateway_price_id?: string
          id?: string
          max_quantity?: number | null
          min_quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_volume_tiers_gateway_price_id_fkey"
            columns: ["gateway_price_id"]
            isOneToOne: false
            referencedRelation: "billing_prices"
            referencedColumns: ["gateway_price_id"]
          },
        ]
      }
      clips: {
        Row: {
          center_x_width: number | null
          center_y_height: number | null
          clip_description: string | null
          clip_id: number
          clip_url: string | null
          created_at: string | null
          cropped_clip_url: string | null
          end_time: number | null
          final_clip_url: string | null
          id: string
          post: string | null
          start_time: number | null
          thumbnail_url: string | null
          title: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          center_x_width?: number | null
          center_y_height?: number | null
          clip_description?: string | null
          clip_id?: number
          clip_url?: string | null
          created_at?: string | null
          cropped_clip_url?: string | null
          end_time?: number | null
          final_clip_url?: string | null
          id?: string
          post?: string | null
          start_time?: number | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          center_x_width?: number | null
          center_y_height?: number | null
          clip_description?: string | null
          clip_id?: number
          clip_url?: string | null
          created_at?: string | null
          cropped_clip_url?: string | null
          end_time?: number | null
          final_clip_url?: string | null
          id?: string
          post?: string | null
          start_time?: number | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clips_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      code_execution: {
        Row: {
          code_snippet: string | null
          created_at: string
          exit_code: number | null
          id: string
          job_id: string
          result: string | null
          stderr: string | null
          stdout: string | null
          timeout_seconds: number | null
          updated_at: string
        }
        Insert: {
          code_snippet?: string | null
          created_at?: string
          exit_code?: number | null
          id?: string
          job_id: string
          result?: string | null
          stderr?: string | null
          stdout?: string | null
          timeout_seconds?: number | null
          updated_at?: string
        }
        Update: {
          code_snippet?: string | null
          created_at?: string
          exit_code?: number | null
          id?: string
          job_id?: string
          result?: string | null
          stderr?: string | null
          stdout?: string | null
          timeout_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_execution_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_execution_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_execution_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_execution_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_audit_logs: {
        Row: {
          action: string
          cookie_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          cookie_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          cookie_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cookie_audit_logs_cookie_id_fkey"
            columns: ["cookie_id"]
            isOneToOne: false
            referencedRelation: "user_cookies"
            referencedColumns: ["id"]
          },
        ]
      }
      elevenlabs_voices: {
        Row: {
          available_for_tiers: Json | null
          category: string | null
          created_at_unix: number | null
          description: string | null
          favorited_at_unix: number | null
          fine_tuning: Json | null
          high_quality_base_model_ids: Json | null
          id: string
          is_legacy: boolean | null
          is_mixed: boolean | null
          is_owner: boolean | null
          labels: Json | null
          name: string
          permission_on_resource: Json | null
          preview_url: string | null
          safety_control: Json | null
          samples: Json | null
          settings: Json | null
          sharing: Json | null
          verified_languages: Json | null
          voice_id: string | null
          voice_verification: Json | null
        }
        Insert: {
          available_for_tiers?: Json | null
          category?: string | null
          created_at_unix?: number | null
          description?: string | null
          favorited_at_unix?: number | null
          fine_tuning?: Json | null
          high_quality_base_model_ids?: Json | null
          id?: string
          is_legacy?: boolean | null
          is_mixed?: boolean | null
          is_owner?: boolean | null
          labels?: Json | null
          name: string
          permission_on_resource?: Json | null
          preview_url?: string | null
          safety_control?: Json | null
          samples?: Json | null
          settings?: Json | null
          sharing?: Json | null
          verified_languages?: Json | null
          voice_id?: string | null
          voice_verification?: Json | null
        }
        Update: {
          available_for_tiers?: Json | null
          category?: string | null
          created_at_unix?: number | null
          description?: string | null
          favorited_at_unix?: number | null
          fine_tuning?: Json | null
          high_quality_base_model_ids?: Json | null
          id?: string
          is_legacy?: boolean | null
          is_mixed?: boolean | null
          is_owner?: boolean | null
          labels?: Json | null
          name?: string
          permission_on_resource?: Json | null
          preview_url?: string | null
          safety_control?: Json | null
          samples?: Json | null
          settings?: Json | null
          sharing?: Json | null
          verified_languages?: Json | null
          voice_id?: string | null
          voice_verification?: Json | null
        }
        Relationships: []
      }
      ffmpeg_compose: {
        Row: {
          bitrate: number | null
          created_at: string
          duration: number | null
          encoder: string | null
          filesize: number | null
          id: string
          job_id: string
          output_url: string | null
          script: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          bitrate?: number | null
          created_at?: string
          duration?: number | null
          encoder?: string | null
          filesize?: number | null
          id?: string
          job_id: string
          output_url?: string | null
          script?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          bitrate?: number | null
          created_at?: string
          duration?: number | null
          encoder?: string | null
          filesize?: number | null
          id?: string
          job_id?: string
          output_url?: string | null
          script?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ffmpeg_compose_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ffmpeg_compose_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ffmpeg_compose_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ffmpeg_compose_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      file_analyses: {
        Row: {
          analysis_id: string
          analysis_table: string
          analysis_type: string
          created_at: string
          file_id: string
          id: string
          job_id: string
        }
        Insert: {
          analysis_id: string
          analysis_table: string
          analysis_type: string
          created_at?: string
          file_id: string
          id?: string
          job_id: string
        }
        Update: {
          analysis_id?: string
          analysis_table?: string
          analysis_type?: string
          created_at?: string
          file_id?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_analyses_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          bucket: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_generated: boolean | null
          mime_type: string | null
          original_name: string
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          bucket?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_generated?: boolean | null
          mime_type?: string | null
          original_name: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          bucket?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_generated?: boolean | null
          mime_type?: string | null
          original_name?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      image_to_video: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_to_video_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_to_video_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_to_video_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_to_video_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_files: {
        Row: {
          created_at: string
          file_id: string
          file_role: string
          id: string
          job_id: string
          sequence_number: number | null
        }
        Insert: {
          created_at?: string
          file_id: string
          file_role: string
          id?: string
          job_id: string
          sequence_number?: number | null
        }
        Update: {
          created_at?: string
          file_id?: string
          file_role?: string
          id?: string
          job_id?: string
          sequence_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          agent_action: string | null
          agent_context: Json | null
          agent_name: string | null
          created_at: string
          custom_id: string | null
          entity_id: string | null
          entity_role: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          nca_build_number: string | null
          nca_code: string | null
          nca_endpoint: string | null
          nca_job_id: string | null
          nca_message: string | null
          nca_pid: number | null
          nca_queue_id: string | null
          nca_queue_length: number | null
          nca_queue_time: number | null
          nca_result_files: Json | null
          nca_run_time: number | null
          nca_total_time: number | null
          processing_status: string | null
          triggered_by: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string
          custom_id?: string | null
          entity_id?: string | null
          entity_role?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string
          custom_id?: string | null
          entity_id?: string | null
          entity_role?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kedb: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          expertise_level: Database["public"]["Enums"]["expertise_level"] | null
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["entry_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          expertise_level?:
            | Database["public"]["Enums"]["expertise_level"]
            | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["entry_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          expertise_level?:
            | Database["public"]["Enums"]["expertise_level"]
            | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["entry_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      locales_voices: {
        Row: {
          id: string
          label: string | null
          language: string | null
          language_code: string | null
          locale: string | null
          tag: string | null
          value: string | null
          voice_id: string | null
        }
        Insert: {
          id?: string
          label?: string | null
          language?: string | null
          language_code?: string | null
          locale?: string | null
          tag?: string | null
          value?: string | null
          voice_id?: string | null
        }
        Update: {
          id?: string
          label?: string | null
          language?: string | null
          language_code?: string | null
          locale?: string | null
          tag?: string | null
          value?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locales_voices_voice_id_fkey"
            columns: ["voice_id"]
            isOneToOne: false
            referencedRelation: "voices"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_author_profiles: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          facebook_handle: string | null
          id: string
          instagram_handle: string | null
          linkedin_handle: string | null
          slug: string
          twitter_handle: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url: string
          bio: string
          created_at?: string
          display_name: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_handle?: string | null
          slug: string
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_handle?: string | null
          slug?: string
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      marketing_blog_author_posts: {
        Row: {
          author_id: string
          post_id: string
        }
        Insert: {
          author_id: string
          post_id: string
        }
        Update: {
          author_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_blog_author_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "marketing_author_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_blog_author_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "marketing_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_blog_post_tags_relationship: {
        Row: {
          blog_post_id: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_blog_post_tags_relationship_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "marketing_blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_blog_post_tags_relationship_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "marketing_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_blog_posts: {
        Row: {
          content: string
          cover_image: string | null
          created_at: string
          id: string
          is_featured: boolean
          json_content: Json
          seo_data: Json | null
          slug: string
          status: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["marketing_blog_post_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_changelog: {
        Row: {
          cover_image: string | null
          created_at: string | null
          id: string
          json_content: Json
          status: Database["public"]["Enums"]["marketing_changelog_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          id?: string
          json_content?: Json
          status?: Database["public"]["Enums"]["marketing_changelog_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          id?: string
          json_content?: Json
          status?: Database["public"]["Enums"]["marketing_changelog_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_changelog_author_relationship: {
        Row: {
          author_id: string
          changelog_id: string
        }
        Insert: {
          author_id: string
          changelog_id: string
        }
        Update: {
          author_id?: string
          changelog_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_changelog_author_relationship_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "marketing_author_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_changelog_author_relationship_changelog_id_fkey"
            columns: ["changelog_id"]
            isOneToOne: false
            referencedRelation: "marketing_changelog"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_board_subscriptions: {
        Row: {
          board_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_board_subscriptions_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_board_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_boards: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          settings: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          settings?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_thread_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: Database["public"]["Enums"]["marketing_feedback_reaction_type"]
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_thread_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_thread_subscriptions: {
        Row: {
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "marketing_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_thread_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_threads: {
        Row: {
          added_to_roadmap: boolean
          content: string
          created_at: string
          id: string
          is_publicly_visible: boolean
          moderator_hold_category:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion: boolean
          priority: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          status: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title: string
          type: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          added_to_roadmap?: boolean
          content: string
          created_at?: string
          id?: string
          is_publicly_visible?: boolean
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion?: boolean
          priority?: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          status?: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title: string
          type?: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          added_to_roadmap?: boolean
          content?: string
          created_at?: string
          id?: string
          is_publicly_visible?: boolean
          moderator_hold_category?:
            | Database["public"]["Enums"]["marketing_feedback_moderator_hold_category"]
            | null
          open_for_public_discussion?: boolean
          priority?: Database["public"]["Enums"]["marketing_feedback_thread_priority"]
          status?: Database["public"]["Enums"]["marketing_feedback_thread_status"]
          title?: string
          type?: Database["public"]["Enums"]["marketing_feedback_thread_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_tags: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      mastra_evals: {
        Row: {
          agent_name: string
          created_at: string
          eval_data: Json
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_name: string
          created_at?: string
          eval_data: Json
          id: string
          metadata?: Json | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          eval_data?: Json
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      mastra_messages: {
        Row: {
          content: string
          createdAt: string
          createdAtZ: string
          id: string
          resourceId: string | null
          role: string
          thread_id: string
          type: string
        }
        Insert: {
          content: string
          createdAt?: string
          createdAtZ?: string
          id: string
          resourceId?: string | null
          role: string
          thread_id: string
          type: string
        }
        Update: {
          content?: string
          createdAt?: string
          createdAtZ?: string
          id?: string
          resourceId?: string | null
          role?: string
          thread_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mastra_messages_thread"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "mastra_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mastra_resources: {
        Row: {
          createdAt: string
          createdAtZ: string
          id: string
          metadata: Json | null
          updatedAt: string
          updatedAtZ: string
          workingMemory: string | null
        }
        Insert: {
          createdAt?: string
          createdAtZ?: string
          id: string
          metadata?: Json | null
          updatedAt?: string
          updatedAtZ?: string
          workingMemory?: string | null
        }
        Update: {
          createdAt?: string
          createdAtZ?: string
          id?: string
          metadata?: Json | null
          updatedAt?: string
          updatedAtZ?: string
          workingMemory?: string | null
        }
        Relationships: []
      }
      mastra_scorers: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          score_data: Json
          scorer_name: string
        }
        Insert: {
          created_at?: string
          id: string
          metadata?: Json | null
          score_data: Json
          scorer_name: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          score_data?: Json
          scorer_name?: string
        }
        Relationships: []
      }
      mastra_threads: {
        Row: {
          createdAt: string
          createdAtZ: string
          id: string
          metadata: string | null
          resourceId: string
          title: string
          updatedAt: string
          updatedAtZ: string
        }
        Insert: {
          createdAt?: string
          createdAtZ?: string
          id: string
          metadata?: string | null
          resourceId: string
          title: string
          updatedAt?: string
          updatedAtZ?: string
        }
        Update: {
          createdAt?: string
          createdAtZ?: string
          id?: string
          metadata?: string | null
          resourceId?: string
          title?: string
          updatedAt?: string
          updatedAtZ?: string
        }
        Relationships: []
      }
      mastra_traces: {
        Row: {
          attributes: Json | null
          created_at: string
          end_time: string | null
          id: string
          metadata: Json | null
          name: string
          start_time: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          end_time?: string | null
          id: string
          metadata?: Json | null
          name: string
          start_time: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          end_time?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          start_time?: string
        }
        Relationships: []
      }
      mastra_working_memory: {
        Row: {
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          scope: string
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          scope?: string
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          scope?: string
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastra_working_memory_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "mastra_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastra_working_memory_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "mastra_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      media_convert: {
        Row: {
          audio_codec: string | null
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_format: string | null
          output_url: string | null
          updated_at: string
          video_codec: string | null
        }
        Insert: {
          audio_codec?: string | null
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_format?: string | null
          output_url?: string | null
          updated_at?: string
          video_codec?: string | null
        }
        Update: {
          audio_codec?: string | null
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_format?: string | null
          output_url?: string | null
          updated_at?: string
          video_codec?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_convert_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_convert_mp3: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_convert_mp3_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_mp3_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_mp3_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_convert_mp3_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_download: {
        Row: {
          audio_codec: string | null
          audio_codec_requested: string | null
          audio_format: string | null
          audio_quality: string | null
          cloud_upload: boolean | null
          cookie_used: boolean | null
          created_at: string
          description: string | null
          download_all_thumbnails: boolean | null
          download_subtitles: boolean | null
          download_thumbnails: boolean | null
          duration: number | null
          embed_thumbnail_in_audio: boolean | null
          ext: string | null
          extract_audio: boolean | null
          filesize: number | null
          format_id: string | null
          fps: number | null
          height: number | null
          id: string
          job_id: string
          max_filesize: number | null
          media_url: string | null
          quality: string | null
          rate_limit: string | null
          resolution: string | null
          retries: number | null
          subtitle_format: string | null
          subtitle_languages: string[] | null
          thumbnail_formats: string | null
          thumbnails: Json | null
          title: string | null
          updated_at: string
          upload_date: string | null
          uploader: string | null
          uploader_id: string | null
          video_codec: string | null
          video_codec_requested: string | null
          view_count: number | null
          width: number | null
        }
        Insert: {
          audio_codec?: string | null
          audio_codec_requested?: string | null
          audio_format?: string | null
          audio_quality?: string | null
          cloud_upload?: boolean | null
          cookie_used?: boolean | null
          created_at?: string
          description?: string | null
          download_all_thumbnails?: boolean | null
          download_subtitles?: boolean | null
          download_thumbnails?: boolean | null
          duration?: number | null
          embed_thumbnail_in_audio?: boolean | null
          ext?: string | null
          extract_audio?: boolean | null
          filesize?: number | null
          format_id?: string | null
          fps?: number | null
          height?: number | null
          id?: string
          job_id: string
          max_filesize?: number | null
          media_url?: string | null
          quality?: string | null
          rate_limit?: string | null
          resolution?: string | null
          retries?: number | null
          subtitle_format?: string | null
          subtitle_languages?: string[] | null
          thumbnail_formats?: string | null
          thumbnails?: Json | null
          title?: string | null
          updated_at?: string
          upload_date?: string | null
          uploader?: string | null
          uploader_id?: string | null
          video_codec?: string | null
          video_codec_requested?: string | null
          view_count?: number | null
          width?: number | null
        }
        Update: {
          audio_codec?: string | null
          audio_codec_requested?: string | null
          audio_format?: string | null
          audio_quality?: string | null
          cloud_upload?: boolean | null
          cookie_used?: boolean | null
          created_at?: string
          description?: string | null
          download_all_thumbnails?: boolean | null
          download_subtitles?: boolean | null
          download_thumbnails?: boolean | null
          duration?: number | null
          embed_thumbnail_in_audio?: boolean | null
          ext?: string | null
          extract_audio?: boolean | null
          filesize?: number | null
          format_id?: string | null
          fps?: number | null
          height?: number | null
          id?: string
          job_id?: string
          max_filesize?: number | null
          media_url?: string | null
          quality?: string | null
          rate_limit?: string | null
          resolution?: string | null
          retries?: number | null
          subtitle_format?: string | null
          subtitle_languages?: string[] | null
          thumbnail_formats?: string | null
          thumbnails?: Json | null
          title?: string | null
          updated_at?: string
          upload_date?: string | null
          uploader?: string | null
          uploader_id?: string | null
          video_codec?: string | null
          video_codec_requested?: string | null
          view_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_download_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_download_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_download_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_download_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_metadata: {
        Row: {
          audio_bitrate: number | null
          audio_bitrate_kbps: number | null
          audio_channels: number | null
          audio_codec: string | null
          audio_codec_long: string | null
          audio_sample_rate: number | null
          audio_sample_rate_khz: number | null
          created_at: string
          duration: number | null
          duration_formatted: string | null
          filesize: number | null
          filesize_mb: number | null
          format: string | null
          fps: number | null
          has_audio: boolean | null
          has_video: boolean | null
          height: number | null
          id: string
          job_id: string
          overall_bitrate: number | null
          overall_bitrate_mbps: number | null
          pixel_format: string | null
          resolution: string | null
          updated_at: string
          video_bitrate: number | null
          video_bitrate_mbps: number | null
          video_codec: string | null
          video_codec_long: string | null
          width: number | null
        }
        Insert: {
          audio_bitrate?: number | null
          audio_bitrate_kbps?: number | null
          audio_channels?: number | null
          audio_codec?: string | null
          audio_codec_long?: string | null
          audio_sample_rate?: number | null
          audio_sample_rate_khz?: number | null
          created_at?: string
          duration?: number | null
          duration_formatted?: string | null
          filesize?: number | null
          filesize_mb?: number | null
          format?: string | null
          fps?: number | null
          has_audio?: boolean | null
          has_video?: boolean | null
          height?: number | null
          id?: string
          job_id: string
          overall_bitrate?: number | null
          overall_bitrate_mbps?: number | null
          pixel_format?: string | null
          resolution?: string | null
          updated_at?: string
          video_bitrate?: number | null
          video_bitrate_mbps?: number | null
          video_codec?: string | null
          video_codec_long?: string | null
          width?: number | null
        }
        Update: {
          audio_bitrate?: number | null
          audio_bitrate_kbps?: number | null
          audio_channels?: number | null
          audio_codec?: string | null
          audio_codec_long?: string | null
          audio_sample_rate?: number | null
          audio_sample_rate_khz?: number | null
          created_at?: string
          duration?: number | null
          duration_formatted?: string | null
          filesize?: number | null
          filesize_mb?: number | null
          format?: string | null
          fps?: number | null
          has_audio?: boolean | null
          has_video?: boolean | null
          height?: number | null
          id?: string
          job_id?: string
          overall_bitrate?: number | null
          overall_bitrate_mbps?: number | null
          pixel_format?: string | null
          resolution?: string | null
          updated_at?: string
          video_bitrate?: number | null
          video_bitrate_mbps?: number | null
          video_codec?: string | null
          video_codec_long?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_metadata_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_metadata_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_metadata_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_metadata_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_silence: {
        Row: {
          created_at: string
          id: string
          job_id: string
          media_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          media_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          media_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_silence_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_silence_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_silence_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_silence_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_transcribe: {
        Row: {
          created_at: string
          id: string
          job_id: string
          language: string | null
          segments: Json | null
          segments_url: string | null
          srt: string | null
          srt_url: string | null
          task: string | null
          text: string | null
          text_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          language?: string | null
          segments?: Json | null
          segments_url?: string | null
          srt?: string | null
          srt_url?: string | null
          task?: string | null
          text?: string | null
          text_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          language?: string | null
          segments?: Json | null
          segments_url?: string | null
          srt?: string | null
          srt_url?: string | null
          task?: string | null
          text?: string | null
          text_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_transcribe_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_transcribe_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_transcribe_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_transcribe_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          created_at: string | null
          id: string
          in_reply_to: string | null
          project_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          in_reply_to?: string | null
          project_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          in_reply_to?: string | null
          project_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          project_status: Database["public"]["Enums"]["project_status"]
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_status?: Database["public"]["Enums"]["project_status"]
          slug?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_status?: Database["public"]["Enums"]["project_status"]
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_upload: {
        Row: {
          bucket: string | null
          created_at: string
          filename: string | null
          id: string
          job_id: string
          provider: string | null
          public: boolean | null
          region: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          bucket?: string | null
          created_at?: string
          filename?: string | null
          id?: string
          job_id: string
          provider?: string | null
          public?: boolean | null
          region?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          bucket?: string | null
          created_at?: string
          filename?: string | null
          id?: string
          job_id?: string
          provider?: string | null
          public?: boolean | null
          region?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "s3_upload_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_upload_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_upload_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_upload_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_files: {
        Row: {
          created_at: string | null
          file_id: string
          file_role: string
          id: string
          scene_id: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          file_role: string
          id?: string
          scene_id: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          file_role?: string
          id?: string
          scene_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_files_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_files_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      scenes: {
        Row: {
          approved: boolean | null
          audio_upload_url: string | null
          audio_url: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          final_scene_url: string | null
          generated_content: Json | null
          id: string
          scene_script: string | null
          sequence_number: number
          settings: Json | null
          status: Database["public"]["Enums"]["scene_status"] | null
          story_id: string | null
          title: string
          updated_at: string | null
          video_upload_url: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          audio_upload_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_scene_url?: string | null
          generated_content?: Json | null
          id?: string
          scene_script?: string | null
          sequence_number: number
          settings?: Json | null
          status?: Database["public"]["Enums"]["scene_status"] | null
          story_id?: string | null
          title: string
          updated_at?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          audio_upload_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_scene_url?: string | null
          generated_content?: Json | null
          id?: string
          scene_script?: string | null
          sequence_number?: number
          settings?: Json | null
          status?: Database["public"]["Enums"]["scene_status"] | null
          story_id?: string | null
          title?: string
          updated_at?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      shot_files: {
        Row: {
          created_at: string | null
          file_id: string
          file_role: string
          id: string
          shot_id: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          file_role: string
          id?: string
          shot_id: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          file_role?: string
          id?: string
          shot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shot_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_files_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shot_files_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          approved: boolean | null
          audio_go: boolean | null
          audio_prompt: string | null
          audio_upload_url: string | null
          audio_url: string | null
          camera_angle: string | null
          created_at: string | null
          cref: string | null
          description: string | null
          duration_seconds: number | null
          final_audio_prompt: string | null
          final_shot_url: string | null
          final_video_prompt: string | null
          generated_content: Json | null
          id: string
          image_go: boolean | null
          image_prompt: string | null
          image_selector: string | null
          image_upload_url: string | null
          image_url: string | null
          scene_id: string | null
          sequence_number: number
          settings: Json | null
          shot_script: string | null
          shot_type: string | null
          sort: number | null
          status: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_go: boolean | null
          video_prompt: string | null
          video_upload_url: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          audio_go?: boolean | null
          audio_prompt?: string | null
          audio_upload_url?: string | null
          audio_url?: string | null
          camera_angle?: string | null
          created_at?: string | null
          cref?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_audio_prompt?: string | null
          final_shot_url?: string | null
          final_video_prompt?: string | null
          generated_content?: Json | null
          id?: string
          image_go?: boolean | null
          image_prompt?: string | null
          image_selector?: string | null
          image_upload_url?: string | null
          image_url?: string | null
          scene_id?: string | null
          sequence_number: number
          settings?: Json | null
          shot_script?: string | null
          shot_type?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_go?: boolean | null
          video_prompt?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          audio_go?: boolean | null
          audio_prompt?: string | null
          audio_upload_url?: string | null
          audio_url?: string | null
          camera_angle?: string | null
          created_at?: string | null
          cref?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_audio_prompt?: string | null
          final_shot_url?: string | null
          final_video_prompt?: string | null
          generated_content?: Json | null
          id?: string
          image_go?: boolean | null
          image_prompt?: string | null
          image_selector?: string | null
          image_upload_url?: string | null
          image_url?: string | null
          scene_id?: string | null
          sequence_number?: number
          settings?: Json | null
          shot_script?: string | null
          shot_type?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_go?: boolean | null
          video_prompt?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      silence_segments: {
        Row: {
          created_at: string
          duration: number | null
          end_time: number
          id: string
          media_silence_id: string
          sequence_number: number
          start_time: number
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_time: number
          id?: string
          media_silence_id: string
          sequence_number: number
          start_time: number
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_time?: number
          id?: string
          media_silence_id?: string
          sequence_number?: number
          start_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "silence_segments_media_silence_id_fkey"
            columns: ["media_silence_id"]
            isOneToOne: false
            referencedRelation: "media_silence"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          active_story: boolean | null
          approve_source: boolean | null
          approved: boolean | null
          created_at: string | null
          description: string | null
          final_video_url: string | null
          final_video_with_captions_url: string | null
          generation_completed_at: string | null
          generation_started_at: string | null
          id: string
          metadata: Json | null
          script: string | null
          settings: Json | null
          sid: number
          source_content_url: string | null
          srt_url: string | null
          status: Database["public"]["Enums"]["story_status"] | null
          story_content: string | null
          story_type_id: string | null
          title: string
          total_generation_time_seconds: number | null
          updated_at: string | null
          user_id: string
          voiceover_url: string | null
        }
        Insert: {
          active_story?: boolean | null
          approve_source?: boolean | null
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          final_video_url?: string | null
          final_video_with_captions_url?: string | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string
          metadata?: Json | null
          script?: string | null
          settings?: Json | null
          sid?: number
          source_content_url?: string | null
          srt_url?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_content?: string | null
          story_type_id?: string | null
          title: string
          total_generation_time_seconds?: number | null
          updated_at?: string | null
          user_id: string
          voiceover_url?: string | null
        }
        Update: {
          active_story?: boolean | null
          approve_source?: boolean | null
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          final_video_url?: string | null
          final_video_with_captions_url?: string | null
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string
          metadata?: Json | null
          script?: string | null
          settings?: Json | null
          sid?: number
          source_content_url?: string | null
          srt_url?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_content?: string | null
          story_type_id?: string | null
          title?: string
          total_generation_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          voiceover_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_story_type_id_fkey"
            columns: ["story_type_id"]
            isOneToOne: false
            referencedRelation: "story_types"
            referencedColumns: ["id"]
          },
        ]
      }
      story_files: {
        Row: {
          created_at: string | null
          file_id: string
          file_role: string
          id: string
          story_id: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          file_role: string
          id?: string
          story_id: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          file_role?: string
          id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_files_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_files_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      story_types: {
        Row: {
          auto_approve_scenes: boolean | null
          auto_approve_shots: boolean | null
          auto_approve_source: boolean | null
          auto_approve_story: boolean | null
          auto_approve_story_gen: boolean | null
          auto_assemble_scenes: boolean | null
          auto_assemble_stories: boolean | null
          auto_run_audio_action: boolean | null
          auto_run_image_action: boolean | null
          auto_run_video_action: boolean | null
          captions_enabled: boolean | null
          created_at: string | null
          description: string | null
          height: number | null
          id: string
          image_prompt_generation_prompt: string | null
          is_active: boolean | null
          is_system_default: boolean | null
          name: string
          scene_generation_prompt: string | null
          settings: Json | null
          shot_generation_system_prompt: string | null
          shot_generation_user_prompt: string | null
          story_prompt_system: string | null
          story_prompt_user: string | null
          updated_at: string | null
          video_prompt_generation_prompt: string | null
          voice_id: string | null
          voice_settings: Json | null
          width: number | null
          workspace_id: string | null
        }
        Insert: {
          auto_approve_scenes?: boolean | null
          auto_approve_shots?: boolean | null
          auto_approve_source?: boolean | null
          auto_approve_story?: boolean | null
          auto_approve_story_gen?: boolean | null
          auto_assemble_scenes?: boolean | null
          auto_assemble_stories?: boolean | null
          auto_run_audio_action?: boolean | null
          auto_run_image_action?: boolean | null
          auto_run_video_action?: boolean | null
          captions_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_prompt_generation_prompt?: string | null
          is_active?: boolean | null
          is_system_default?: boolean | null
          name: string
          scene_generation_prompt?: string | null
          settings?: Json | null
          shot_generation_system_prompt?: string | null
          shot_generation_user_prompt?: string | null
          story_prompt_system?: string | null
          story_prompt_user?: string | null
          updated_at?: string | null
          video_prompt_generation_prompt?: string | null
          voice_id?: string | null
          voice_settings?: Json | null
          width?: number | null
          workspace_id?: string | null
        }
        Update: {
          auto_approve_scenes?: boolean | null
          auto_approve_shots?: boolean | null
          auto_approve_source?: boolean | null
          auto_approve_story?: boolean | null
          auto_approve_story_gen?: boolean | null
          auto_assemble_scenes?: boolean | null
          auto_assemble_stories?: boolean | null
          auto_run_audio_action?: boolean | null
          auto_run_image_action?: boolean | null
          auto_run_video_action?: boolean | null
          captions_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_prompt_generation_prompt?: string | null
          is_active?: boolean | null
          is_system_default?: boolean | null
          name?: string
          scene_generation_prompt?: string | null
          settings?: Json | null
          shot_generation_system_prompt?: string | null
          shot_generation_user_prompt?: string | null
          story_prompt_system?: string | null
          story_prompt_user?: string | null
          updated_at?: string | null
          video_prompt_generation_prompt?: string | null
          voice_id?: string | null
          voice_settings?: Json | null
          width?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_types_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: number
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: number
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: number
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          is_revoked: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id?: string
          masked_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_application_settings: {
        Row: {
          email_readonly: string
          id: string
        }
        Insert: {
          email_readonly: string
          id: string
        }
        Update: {
          email_readonly?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_application_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cookies: {
        Row: {
          created_at: string | null
          encrypted_cookies: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          last_used_at: string | null
          platform: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_cookies: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          last_used_at?: string | null
          platform: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_cookies?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          last_used_at?: string | null
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_seen: boolean
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          last_seen_at: string
          status: Database["public"]["Enums"]["online_status"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          last_seen_at?: string
          status?: Database["public"]["Enums"]["online_status"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          last_seen_at?: string
          status?: Database["public"]["Enums"]["online_status"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          default_workspace: string | null
          id: string
        }
        Insert: {
          default_workspace?: string | null
          id: string
        }
        Update: {
          default_workspace?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_caption: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          font_color: string | null
          font_size: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          position: string | null
          subtitle_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          font_color?: string | null
          font_size?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          position?: string | null
          subtitle_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          font_color?: string | null
          font_size?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          position?: string | null
          subtitle_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_caption_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_caption_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_caption_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_caption_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_concatenate: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_concatenate_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_cut: {
        Row: {
          created_at: string
          duration: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_cut_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_cut_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_cut_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_cut_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_split: {
        Row: {
          created_at: string
          id: string
          job_id: string
          segment_count: number | null
          split_interval: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          segment_count?: number | null
          split_interval?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          segment_count?: number | null
          split_interval?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_split_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_split_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_split_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_split_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_split_segments: {
        Row: {
          created_at: string
          duration: number | null
          file_url: string
          filename: string
          filesize: number | null
          id: string
          segment_number: number
          video_split_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_url: string
          filename: string
          filesize?: number | null
          id?: string
          segment_number: number
          video_split_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_url?: string
          filename?: string
          filesize?: number | null
          id?: string
          segment_number?: number
          video_split_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_split_segments_video_split_id_fkey"
            columns: ["video_split_id"]
            isOneToOne: false
            referencedRelation: "video_split"
            referencedColumns: ["id"]
          },
        ]
      }
      video_thumbnail: {
        Row: {
          created_at: string
          filesize: number | null
          height: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          thumbnail_time: number | null
          updated_at: string
          width: number | null
        }
        Insert: {
          created_at?: string
          filesize?: number | null
          height?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          thumbnail_time?: number | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          created_at?: string
          filesize?: number | null
          height?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          thumbnail_time?: number | null
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_thumbnail_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_thumbnail_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_thumbnail_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_thumbnail_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      video_trim: {
        Row: {
          created_at: string
          duration: number | null
          end_time: number | null
          filesize: number | null
          id: string
          job_id: string
          mime_type: string | null
          output_url: string | null
          start_time: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_time?: number | null
          filesize?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          output_url?: string | null
          start_time?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_time?: number | null
          filesize?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          output_url?: string | null
          start_time?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_trim_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_trim_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_trim_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_trim_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "video_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          active_video: boolean | null
          clip_height: number | null
          clip_width: number | null
          created_at: string | null
          description: string | null
          id: string
          segments_url: string | null
          source_file_id: string | null
          srt_url: string | null
          transcript_url: string | null
          updated_at: string | null
          user_id: string
          vid: number
          video_height: number | null
          video_url: string | null
          video_width: number | null
          videos_to_create: number | null
        }
        Insert: {
          active_video?: boolean | null
          clip_height?: number | null
          clip_width?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          segments_url?: string | null
          source_file_id?: string | null
          srt_url?: string | null
          transcript_url?: string | null
          updated_at?: string | null
          user_id: string
          vid?: number
          video_height?: number | null
          video_url?: string | null
          video_width?: number | null
          videos_to_create?: number | null
        }
        Update: {
          active_video?: boolean | null
          clip_height?: number | null
          clip_width?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          segments_url?: string | null
          source_file_id?: string | null
          srt_url?: string | null
          transcript_url?: string | null
          updated_at?: string | null
          user_id?: string
          vid?: number
          video_height?: number | null
          video_url?: string | null
          video_width?: number | null
          videos_to_create?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files_with_input_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files_with_output_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      voices: {
        Row: {
          emotion_support: boolean | null
          gender: string | null
          id: string
          language: string | null
          name: string
          preview_audio: string | null
          support_interactive_avatar: boolean | null
          support_locale: boolean | null
          support_pause: boolean | null
          voice_id: string | null
        }
        Insert: {
          emotion_support?: boolean | null
          gender?: string | null
          id?: string
          language?: string | null
          name: string
          preview_audio?: string | null
          support_interactive_avatar?: boolean | null
          support_locale?: boolean | null
          support_pause?: boolean | null
          voice_id?: string | null
        }
        Update: {
          emotion_support?: boolean | null
          gender?: string | null
          id?: string
          language?: string | null
          name?: string
          preview_audio?: string | null
          support_interactive_avatar?: boolean | null
          support_locale?: boolean | null
          support_pause?: boolean | null
          voice_id?: string | null
        }
        Relationships: []
      }
      workspace_admin_settings: {
        Row: {
          workspace_id: string
          workspace_settings: Json
        }
        Insert: {
          workspace_id: string
          workspace_settings?: Json
        }
        Update: {
          workspace_id?: string
          workspace_settings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workspace_admin_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_application_settings: {
        Row: {
          membership_type: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id: string
        }
        Insert: {
          membership_type?: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id: string
        }
        Update: {
          membership_type?: Database["public"]["Enums"]["workspace_membership_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_application_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "workspace_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          last_message_at: string | null
          name: string | null
          participant_1_id: string | null
          participant_2_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          name?: string | null
          participant_1_id?: string | null
          participant_2_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          last_message_at?: string | null
          name?: string | null
          participant_1_id?: string | null
          participant_2_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_credits: {
        Row: {
          credits: number
          id: string
          last_reset_date: string | null
          workspace_id: string
        }
        Insert: {
          credits?: number
          id?: string
          last_reset_date?: string | null
          workspace_id: string
        }
        Update: {
          credits?: number
          id?: string
          last_reset_date?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_credits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_credits_logs: {
        Row: {
          change_type: string
          changed_at: string
          id: string
          new_credits: number | null
          old_credits: number | null
          workspace_credits_id: string
          workspace_id: string
        }
        Insert: {
          change_type: string
          changed_at?: string
          id?: string
          new_credits?: number | null
          old_credits?: number | null
          workspace_credits_id: string
          workspace_id: string
        }
        Update: {
          change_type?: string
          changed_at?: string
          id?: string
          new_credits?: number | null
          old_credits?: number | null
          workspace_credits_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_credits_logs_workspace_credits_id_fkey"
            columns: ["workspace_credits_id"]
            isOneToOne: false
            referencedRelation: "workspace_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_credits_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          created_at: string
          id: string
          invitee_user_email: string
          invitee_user_id: string | null
          invitee_user_role: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id: string
          status: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_user_email: string
          invitee_user_id?: string | null
          invitee_user_role?: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id: string
          status?: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitee_user_email?: string
          invitee_user_id?: string | null
          invitee_user_role?: Database["public"]["Enums"]["workspace_member_role_type"]
          inviter_user_id?: string
          status?: Database["public"]["Enums"]["workspace_invitation_link_status"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          added_at: string
          id: string
          workspace_id: string
          workspace_member_id: string
          workspace_member_role: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Insert: {
          added_at?: string
          id?: string
          workspace_id: string
          workspace_member_id: string
          workspace_member_role: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Update: {
          added_at?: string
          id?: string
          workspace_id?: string
          workspace_member_id?: string
          workspace_member_role?: Database["public"]["Enums"]["workspace_member_role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_member_id_fkey"
            columns: ["workspace_member_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_message_receipts: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_message_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "workspace_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_message_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_messages: {
        Row: {
          attachment_metadata: Json | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_metadata?: Json | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_metadata?: Json | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "workspace_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          workspace_id: string
          workspace_settings: Json
        }
        Insert: {
          workspace_id: string
          workspace_settings?: Json
        }
        Update: {
          workspace_id?: string
          workspace_settings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      agent_jobs: {
        Row: {
          agent_action: string | null
          agent_context: Json | null
          agent_name: string | null
          created_at: string | null
          custom_id: string | null
          entity_id: string | null
          entity_role: string | null
          entity_title: string | null
          entity_type: string | null
          error_message: string | null
          id: string | null
          nca_build_number: string | null
          nca_code: string | null
          nca_endpoint: string | null
          nca_job_id: string | null
          nca_message: string | null
          nca_pid: number | null
          nca_queue_id: string | null
          nca_queue_length: number | null
          nca_queue_time: number | null
          nca_result_files: Json | null
          nca_run_time: number | null
          nca_total_time: number | null
          processing_status: string | null
          triggered_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string | null
          custom_id?: string | null
          entity_id?: string | null
          entity_role?: string | null
          entity_title?: never
          entity_type?: string | null
          error_message?: string | null
          id?: string | null
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string | null
          custom_id?: string | null
          entity_id?: string | null
          entity_role?: string | null
          entity_title?: never
          entity_type?: string | null
          error_message?: string | null
          id?: string | null
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      files_with_input_jobs: {
        Row: {
          bucket: string | null
          created_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string | null
          input_jobs: Json | null
          is_generated: boolean | null
          mime_type: string | null
          original_name: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Relationships: []
      }
      files_with_output_jobs: {
        Row: {
          bucket: string | null
          created_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string | null
          is_generated: boolean | null
          mime_type: string | null
          original_name: string | null
          output_jobs: Json | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Relationships: []
      }
      jobs_by_agent: {
        Row: {
          agent_name: string | null
          avg_processing_time_seconds: number | null
          completed_jobs: number | null
          failed_jobs: number | null
          last_job_created: string | null
          processing_jobs: number | null
          total_jobs: number | null
        }
        Relationships: []
      }
      jobs_with_files: {
        Row: {
          created_at: string | null
          custom_id: string | null
          error_message: string | null
          id: string | null
          input_files: Json | null
          nca_build_number: string | null
          nca_code: string | null
          nca_endpoint: string | null
          nca_job_id: string | null
          nca_message: string | null
          nca_pid: number | null
          nca_queue_id: string | null
          nca_queue_length: number | null
          nca_queue_time: number | null
          nca_result_files: Json | null
          nca_run_time: number | null
          nca_total_time: number | null
          output_files: Json | null
          processing_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_id?: string | null
          error_message?: string | null
          id?: string | null
          input_files?: never
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          output_files?: never
          processing_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_id?: string | null
          error_message?: string | null
          id?: string | null
          input_files?: never
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          output_files?: never
          processing_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scenes_with_files: {
        Row: {
          approved: boolean | null
          audio_file: Json | null
          audio_upload_url: string | null
          audio_url: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          final_scene_file: Json | null
          final_scene_url: string | null
          generated_content: Json | null
          id: string | null
          scene_script: string | null
          sequence_number: number | null
          settings: Json | null
          status: Database["public"]["Enums"]["scene_status"] | null
          story_id: string | null
          title: string | null
          updated_at: string | null
          video_file: Json | null
          video_upload_url: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          audio_file?: never
          audio_upload_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_scene_file?: never
          final_scene_url?: string | null
          generated_content?: Json | null
          id?: string | null
          scene_script?: string | null
          sequence_number?: number | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["scene_status"] | null
          story_id?: string | null
          title?: string | null
          updated_at?: string | null
          video_file?: never
          video_upload_url?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          audio_file?: never
          audio_upload_url?: string | null
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_scene_file?: never
          final_scene_url?: string | null
          generated_content?: Json | null
          id?: string | null
          scene_script?: string | null
          sequence_number?: number | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["scene_status"] | null
          story_id?: string | null
          title?: string | null
          updated_at?: string | null
          video_file?: never
          video_upload_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      shots_with_files: {
        Row: {
          approved: boolean | null
          audio_file: Json | null
          audio_go: boolean | null
          audio_prompt: string | null
          audio_upload_url: string | null
          audio_url: string | null
          camera_angle: string | null
          created_at: string | null
          cref: string | null
          description: string | null
          duration_seconds: number | null
          final_audio_prompt: string | null
          final_shot_file: Json | null
          final_shot_url: string | null
          final_video_prompt: string | null
          generated_content: Json | null
          id: string | null
          image_file: Json | null
          image_go: boolean | null
          image_prompt: string | null
          image_selector: string | null
          image_upload_url: string | null
          image_url: string | null
          scene_id: string | null
          sequence_number: number | null
          settings: Json | null
          shot_script: string | null
          shot_type: string | null
          sort: number | null
          status: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          video_file: Json | null
          video_go: boolean | null
          video_prompt: string | null
          video_upload_url: string | null
          video_url: string | null
        }
        Insert: {
          approved?: boolean | null
          audio_file?: never
          audio_go?: boolean | null
          audio_prompt?: string | null
          audio_upload_url?: string | null
          audio_url?: string | null
          camera_angle?: string | null
          created_at?: string | null
          cref?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_audio_prompt?: string | null
          final_shot_file?: never
          final_shot_url?: string | null
          final_video_prompt?: string | null
          generated_content?: Json | null
          id?: string | null
          image_file?: never
          image_go?: boolean | null
          image_prompt?: string | null
          image_selector?: string | null
          image_upload_url?: string | null
          image_url?: string | null
          scene_id?: string | null
          sequence_number?: number | null
          settings?: Json | null
          shot_script?: string | null
          shot_type?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_file?: never
          video_go?: boolean | null
          video_prompt?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Update: {
          approved?: boolean | null
          audio_file?: never
          audio_go?: boolean | null
          audio_prompt?: string | null
          audio_upload_url?: string | null
          audio_url?: string | null
          camera_angle?: string | null
          created_at?: string | null
          cref?: string | null
          description?: string | null
          duration_seconds?: number | null
          final_audio_prompt?: string | null
          final_shot_file?: never
          final_shot_url?: string | null
          final_video_prompt?: string | null
          generated_content?: Json | null
          id?: string | null
          image_file?: never
          image_go?: boolean | null
          image_prompt?: string | null
          image_selector?: string | null
          image_upload_url?: string | null
          image_url?: string | null
          scene_id?: string | null
          sequence_number?: number | null
          settings?: Json | null
          shot_script?: string | null
          shot_type?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["shot_status"] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_file?: never
          video_go?: boolean | null
          video_prompt?: string | null
          video_upload_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes_with_files"
            referencedColumns: ["id"]
          },
        ]
      }
      stories_with_files: {
        Row: {
          active_story: boolean | null
          approve_source: boolean | null
          approved: boolean | null
          created_at: string | null
          description: string | null
          final_video_file: Json | null
          final_video_url: string | null
          final_video_with_captions_url: string | null
          final_with_captions_file: Json | null
          generation_completed_at: string | null
          generation_started_at: string | null
          id: string | null
          metadata: Json | null
          script: string | null
          settings: Json | null
          sid: number | null
          source_content_url: string | null
          srt_url: string | null
          status: Database["public"]["Enums"]["story_status"] | null
          story_content: string | null
          story_type_id: string | null
          title: string | null
          total_generation_time_seconds: number | null
          updated_at: string | null
          user_id: string | null
          voiceover_file: Json | null
          voiceover_url: string | null
        }
        Insert: {
          active_story?: boolean | null
          approve_source?: boolean | null
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          final_video_file?: never
          final_video_url?: string | null
          final_video_with_captions_url?: string | null
          final_with_captions_file?: never
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string | null
          metadata?: Json | null
          script?: string | null
          settings?: Json | null
          sid?: number | null
          source_content_url?: string | null
          srt_url?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_content?: string | null
          story_type_id?: string | null
          title?: string | null
          total_generation_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          voiceover_file?: never
          voiceover_url?: string | null
        }
        Update: {
          active_story?: boolean | null
          approve_source?: boolean | null
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          final_video_file?: never
          final_video_url?: string | null
          final_video_with_captions_url?: string | null
          final_with_captions_file?: never
          generation_completed_at?: string | null
          generation_started_at?: string | null
          id?: string | null
          metadata?: Json | null
          script?: string | null
          settings?: Json | null
          sid?: number | null
          source_content_url?: string | null
          srt_url?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_content?: string | null
          story_type_id?: string | null
          title?: string | null
          total_generation_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          voiceover_file?: never
          voiceover_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_story_type_id_fkey"
            columns: ["story_type_id"]
            isOneToOne: false
            referencedRelation: "story_types"
            referencedColumns: ["id"]
          },
        ]
      }
      video_generation_jobs: {
        Row: {
          agent_action: string | null
          agent_context: Json | null
          agent_name: string | null
          created_at: string | null
          custom_id: string | null
          entity_details: Json | null
          entity_id: string | null
          entity_role: string | null
          entity_type: string | null
          error_message: string | null
          id: string | null
          nca_build_number: string | null
          nca_code: string | null
          nca_endpoint: string | null
          nca_job_id: string | null
          nca_message: string | null
          nca_pid: number | null
          nca_queue_id: string | null
          nca_queue_length: number | null
          nca_queue_time: number | null
          nca_result_files: Json | null
          nca_run_time: number | null
          nca_total_time: number | null
          output_files: Json | null
          processing_status: string | null
          triggered_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string | null
          custom_id?: string | null
          entity_details?: never
          entity_id?: string | null
          entity_role?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string | null
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          output_files?: never
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_action?: string | null
          agent_context?: Json | null
          agent_name?: string | null
          created_at?: string | null
          custom_id?: string | null
          entity_details?: never
          entity_id?: string | null
          entity_role?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string | null
          nca_build_number?: string | null
          nca_code?: string | null
          nca_endpoint?: string | null
          nca_job_id?: string | null
          nca_message?: string | null
          nca_pid?: number | null
          nca_queue_id?: string | null
          nca_queue_length?: number | null
          nca_queue_time?: number | null
          nca_result_files?: Json | null
          nca_run_time?: number | null
          nca_total_time?: number | null
          output_files?: never
          processing_status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_participant_to_conversation: {
        Args: {
          p_added_by: string
          p_conversation_id: string
          p_user_id: string
        }
        Returns: {
          conversation_id: string
          joined_at: string
          role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_conversation_participants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_workspace_storage_quota: {
        Args: { p_file_size_bytes: number; p_workspace_id: string }
        Returns: Json
      }
      create_agent_tracked_job: {
        Args: {
          p_agent_action: string
          p_agent_context?: Json
          p_agent_name: string
          p_entity_id?: string
          p_entity_role?: string
          p_entity_type?: string
          p_nca_endpoint: string
          p_nca_job_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_group_conversation: {
        Args: {
          p_creator_id: string
          p_name: string
          p_participant_ids: string[]
          p_workspace_id: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          last_message_at: string | null
          name: string | null
          participant_1_id: string | null
          participant_2_id: string | null
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_active_user_cookie: {
        Args: { p_user_id: string }
        Returns: {
          encrypted_cookies: string
          expires_at: string
          id: string
          label: string
          platform: string
        }[]
      }
      get_clip_aspect_ratio: { Args: { v_id: string }; Returns: number }
      get_clip_duration: { Args: { c_id: string }; Returns: number }
      get_clip_left_x_width: { Args: { c_id: string }; Returns: number }
      get_clip_top_y_height: { Args: { c_id: string }; Returns: number }
      get_conversation_participants: {
        Args: { p_conversation_id: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          joined_at: string
          role: string
          user_id: string
        }[]
      }
      get_crop_x_width: { Args: { c_id: string }; Returns: number }
      get_crop_y_height: { Args: { c_id: string }; Returns: number }
      get_customer_workspace_id: {
        Args: { gateway_customer_id: string }
        Returns: string
      }
      get_or_create_conversation: {
        Args: {
          p_user_1_id: string
          p_user_2_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      get_project_workspace_uuid: {
        Args: { project_id: string }
        Returns: string
      }
      get_threads_with_message_counts: {
        Args: { p_user_id: string }
        Returns: {
          createdAt: string
          id: string
          message_count: number
          metadata: string
          title: string
          updatedAt: string
        }[]
      }
      get_unread_count: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      get_video_aspect_ratio: { Args: { v_id: string }; Returns: number }
      get_workspace_storage_quota: {
        Args: { p_workspace_id: string }
        Returns: number
      }
      get_workspace_storage_usage: {
        Args: { p_workspace_id: string }
        Returns: number
      }
      is_application_admin: { Args: { user_id: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      is_cookie_expired: { Args: { cookie_id: string }; Returns: boolean }
      is_workspace_admin: {
        Args: { user_id: string; workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { user_id: string; workspace_id: string }
        Returns: boolean
      }
      remove_participant_from_conversation: {
        Args: {
          p_conversation_id: string
          p_removed_by: string
          p_user_id: string
        }
        Returns: boolean
      }
      search_workspace_messages: {
        Args: {
          p_limit?: number
          p_search_query: string
          p_user_id: string
          p_workspace_id: string
        }
        Returns: {
          content: string
          conversation_id: string
          created_at: string
          message_id: string
          message_type: Database["public"]["Enums"]["message_type"]
          rank: number
          sender_id: string
          sender_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
      avatar_group_status: "active" | "inactive" | "deprecated"
      avatar_status: "active" | "inactive" | "deprecated"
      entry_status: "draft" | "published" | "archived"
      expertise_level: "beginner" | "intermediate" | "advanced" | "expert"
      marketing_blog_post_status: "draft" | "published"
      marketing_changelog_status: "draft" | "published"
      marketing_feedback_moderator_hold_category:
        | "spam"
        | "off_topic"
        | "inappropriate"
        | "other"
      marketing_feedback_reaction_type:
        | "like"
        | "heart"
        | "celebrate"
        | "upvote"
      marketing_feedback_thread_priority: "low" | "medium" | "high"
      marketing_feedback_thread_status:
        | "open"
        | "under_review"
        | "planned"
        | "closed"
        | "in_progress"
        | "completed"
        | "moderator_hold"
      marketing_feedback_thread_type: "bug" | "feature_request" | "general"
      message_type: "text" | "image" | "video" | "audio" | "file"
      online_status: "online" | "away" | "offline"
      organization_joining_status:
        | "invited"
        | "joinied"
        | "declined_invitation"
        | "joined"
      organization_member_role: "owner" | "admin" | "member" | "readonly"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      project_status: "draft" | "pending_approval" | "approved" | "completed"
      project_team_member_role: "admin" | "member" | "readonly"
      scene_status: "planned" | "generating" | "completed" | "failed"
      shot_status: "pending" | "generating" | "completed" | "failed"
      story_status: "draft" | "in_progress" | "completed" | "archived"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      workspace_invitation_link_status:
        | "active"
        | "finished_accepted"
        | "finished_declined"
        | "inactive"
      workspace_member_role_type: "owner" | "admin" | "member" | "readonly"
      workspace_membership_type: "solo" | "team"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin"],
      avatar_group_status: ["active", "inactive", "deprecated"],
      avatar_status: ["active", "inactive", "deprecated"],
      entry_status: ["draft", "published", "archived"],
      expertise_level: ["beginner", "intermediate", "advanced", "expert"],
      marketing_blog_post_status: ["draft", "published"],
      marketing_changelog_status: ["draft", "published"],
      marketing_feedback_moderator_hold_category: [
        "spam",
        "off_topic",
        "inappropriate",
        "other",
      ],
      marketing_feedback_reaction_type: [
        "like",
        "heart",
        "celebrate",
        "upvote",
      ],
      marketing_feedback_thread_priority: ["low", "medium", "high"],
      marketing_feedback_thread_status: [
        "open",
        "under_review",
        "planned",
        "closed",
        "in_progress",
        "completed",
        "moderator_hold",
      ],
      marketing_feedback_thread_type: ["bug", "feature_request", "general"],
      message_type: ["text", "image", "video", "audio", "file"],
      online_status: ["online", "away", "offline"],
      organization_joining_status: [
        "invited",
        "joinied",
        "declined_invitation",
        "joined",
      ],
      organization_member_role: ["owner", "admin", "member", "readonly"],
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      project_status: ["draft", "pending_approval", "approved", "completed"],
      project_team_member_role: ["admin", "member", "readonly"],
      scene_status: ["planned", "generating", "completed", "failed"],
      shot_status: ["pending", "generating", "completed", "failed"],
      story_status: ["draft", "in_progress", "completed", "archived"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      workspace_invitation_link_status: [
        "active",
        "finished_accepted",
        "finished_declined",
        "inactive",
      ],
      workspace_member_role_type: ["owner", "admin", "member", "readonly"],
      workspace_membership_type: ["solo", "team"],
    },
  },
} as const

