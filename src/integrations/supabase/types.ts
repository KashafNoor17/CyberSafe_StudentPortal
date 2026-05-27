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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_content_cache: {
        Row: {
          access_count: number
          content_hash: string
          content_type: string
          created_at: string
          id: string
          response: Json
        }
        Insert: {
          access_count?: number
          content_hash: string
          content_type?: string
          created_at?: string
          id?: string
          response?: Json
        }
        Update: {
          access_count?: number
          content_hash?: string
          content_type?: string
          created_at?: string
          id?: string
          response?: Json
        }
        Relationships: []
      }
      ai_feedback: {
        Row: {
          created_at: string
          helpful: boolean | null
          id: string
          interaction_id: string
          user_comment: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          created_at?: string
          helpful?: boolean | null
          id?: string
          interaction_id: string
          user_comment?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          created_at?: string
          helpful?: boolean | null
          id?: string
          interaction_id?: string
          user_comment?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "ai_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_content: {
        Row: {
          approved: boolean | null
          content_data: Json
          content_type: string
          created_at: string
          created_by: string
          id: string
          model_version: string
          prompt_used: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          approved?: boolean | null
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by: string
          id?: string
          model_version?: string
          prompt_used?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          approved?: boolean | null
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          model_version?: string
          prompt_used?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          latency_ms: number
          model_version: string
          prompt: string
          response: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type?: string
          latency_ms?: number
          model_version?: string
          prompt?: string
          response?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          latency_ms?: number
          model_version?: string
          prompt?: string
          response?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      anonymized_completions: {
        Row: {
          anonymized_user_id: string
          attempts_before_complete: number | null
          completed_at: string | null
          dataset_id: string | null
          id: string
          module_id: string | null
          quiz_score: number | null
          time_spent_minutes: number | null
        }
        Insert: {
          anonymized_user_id: string
          attempts_before_complete?: number | null
          completed_at?: string | null
          dataset_id?: string | null
          id?: string
          module_id?: string | null
          quiz_score?: number | null
          time_spent_minutes?: number | null
        }
        Update: {
          anonymized_user_id?: string
          attempts_before_complete?: number | null
          completed_at?: string | null
          dataset_id?: string | null
          id?: string
          module_id?: string | null
          quiz_score?: number | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymized_completions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymized_quiz_attempts: {
        Row: {
          anonymized_user_id: string
          attempt_number: number | null
          dataset_id: string | null
          id: string
          is_correct: boolean | null
          module_id: string | null
          question_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          anonymized_user_id: string
          attempt_number?: number | null
          dataset_id?: string | null
          id?: string
          is_correct?: boolean | null
          module_id?: string | null
          question_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          anonymized_user_id?: string
          attempt_number?: number | null
          dataset_id?: string | null
          id?: string
          is_correct?: boolean | null
          module_id?: string | null
          question_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymized_quiz_attempts_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymized_user_records: {
        Row: {
          anonymized_user_id: string
          badge_count: number
          dataset_id: string
          id: string
          module_completions: Json
          quiz_scores: Json
          streak_data: Json
          time_spent: number
        }
        Insert: {
          anonymized_user_id: string
          badge_count?: number
          dataset_id: string
          id?: string
          module_completions?: Json
          quiz_scores?: Json
          streak_data?: Json
          time_spent?: number
        }
        Update: {
          anonymized_user_id?: string
          badge_count?: number
          dataset_id?: string
          id?: string
          module_completions?: Json
          quiz_scores?: Json
          streak_data?: Json
          time_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "anonymized_user_records_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      awareness_campaign_targets: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "awareness_campaign_targets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "awareness_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      awareness_campaigns: {
        Row: {
          campaign_type: string | null
          completion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_group: string | null
        }
        Insert: {
          campaign_type?: string | null
          completion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_group?: string | null
        }
        Update: {
          campaign_type?: string | null
          completion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_group?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_key: string | null
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          badge_key?: string | null
          category?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          badge_key?: string | null
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      beta_signups: {
        Row: {
          consent: boolean
          created_at: string
          device_type: string
          email: string
          experience_level: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          device_type?: string
          email: string
          experience_level?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          device_type?: string
          email?: string
          experience_level?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      breach_alerts: {
        Row: {
          acknowledged_at: string | null
          affected_data: string
          breach_date: string | null
          breach_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          affected_data?: string
          breach_date?: string | null
          breach_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          affected_data?: string
          breach_date?: string | null
          breach_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      breach_checks: {
        Row: {
          checked_at: string
          email: string
          found_in_breaches: Json
          id: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          email: string
          found_in_breaches?: Json
          id?: string
          user_id: string
        }
        Update: {
          checked_at?: string
          email?: string
          found_in_breaches?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_targets: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          credentials_submitted: boolean | null
          email_sent_at: string | null
          id: string
          opened_at: string | null
          reported_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          credentials_submitted?: boolean | null
          email_sent_at?: string | null
          id?: string
          opened_at?: string | null
          reported_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          credentials_submitted?: boolean | null
          email_sent_at?: string | null
          id?: string
          opened_at?: string | null
          reported_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_targets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "phishing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          id: string
          is_verified: boolean | null
          issued_at: string
          qr_code_data: string | null
          user_id: string
          verification_id: string | null
        }
        Insert: {
          certificate_number: string
          id?: string
          is_verified?: boolean | null
          issued_at?: string
          qr_code_data?: string | null
          user_id: string
          verification_id?: string | null
        }
        Update: {
          certificate_number?: string
          id?: string
          is_verified?: boolean | null
          issued_at?: string
          qr_code_data?: string | null
          user_id?: string
          verification_id?: string | null
        }
        Relationships: []
      }
      challenge_votes: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_votes_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_reward: string | null
          challenge_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          points_reward: number
          requirement_count: number
          requirement_type: string
          title: string
        }
        Insert: {
          badge_reward?: string | null
          challenge_type?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          points_reward?: number
          requirement_count?: number
          requirement_type: string
          title: string
        }
        Update: {
          badge_reward?: string | null
          challenge_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          points_reward?: number
          requirement_count?: number
          requirement_type?: string
          title?: string
        }
        Relationships: []
      }
      cohort_analysis: {
        Row: {
          calculated_at: string
          cohort_date: string
          cohort_size: number
          id: string
          month_3_retention: number | null
          month_6_retention: number | null
          week_1_retention: number | null
          week_2_retention: number | null
          week_4_retention: number | null
          week_8_retention: number | null
        }
        Insert: {
          calculated_at?: string
          cohort_date: string
          cohort_size?: number
          id?: string
          month_3_retention?: number | null
          month_6_retention?: number | null
          week_1_retention?: number | null
          week_2_retention?: number | null
          week_4_retention?: number | null
          week_8_retention?: number | null
        }
        Update: {
          calculated_at?: string
          cohort_date?: string
          cohort_size?: number
          id?: string
          month_3_retention?: number | null
          month_6_retention?: number | null
          week_1_retention?: number | null
          week_2_retention?: number | null
          week_4_retention?: number | null
          week_8_retention?: number | null
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          category: string | null
          connection_info: string | null
          created_at: string | null
          description: string
          difficulty: string | null
          downvotes: number | null
          featured: boolean | null
          file_attachments: Json | null
          flag_hash: string | null
          hints: Json | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          connection_info?: string | null
          created_at?: string | null
          description: string
          difficulty?: string | null
          downvotes?: number | null
          featured?: boolean | null
          file_attachments?: Json | null
          flag_hash?: string | null
          hints?: Json | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          connection_info?: string | null
          created_at?: string | null
          description?: string
          difficulty?: string | null
          downvotes?: number | null
          featured?: boolean | null
          file_attachments?: Json | null
          flag_hash?: string | null
          hints?: Json | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          created_at: string | null
          created_by: string
          current_attendees: number | null
          description: string | null
          duration_minutes: number | null
          event_type: string | null
          id: string
          max_attendees: number | null
          scheduled_time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_attendees?: number | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          id?: string
          max_attendees?: number | null
          scheduled_time: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_attendees?: number | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          id?: string
          max_attendees?: number | null
          scheduled_time?: string
          title?: string
        }
        Relationships: []
      }
      compliance_frameworks: {
        Row: {
          created_at: string
          description: string
          id: string
          industry: string
          is_active: boolean
          name: string
          regulatory_body: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          industry?: string
          is_active?: boolean
          name: string
          regulatory_body?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          industry?: string
          is_active?: boolean
          name?: string
          regulatory_body?: string
          version?: string
        }
        Relationships: []
      }
      compliance_mappings: {
        Row: {
          coverage_percentage: number
          created_at: string
          id: string
          mapping_type: string
          module_id: string
          requirement_id: string
        }
        Insert: {
          coverage_percentage?: number
          created_at?: string
          id?: string
          mapping_type?: string
          module_id: string
          requirement_id: string
        }
        Update: {
          coverage_percentage?: number
          created_at?: string
          id?: string
          mapping_type?: string
          module_id?: string
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_mappings_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_mappings_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          control_family: string
          created_at: string
          description: string
          framework_id: string
          id: string
          priority: string
          requirement_code: string
          title: string
        }
        Insert: {
          control_family?: string
          created_at?: string
          description?: string
          framework_id: string
          id?: string
          priority?: string
          requirement_code?: string
          title: string
        }
        Update: {
          control_family?: string
          created_at?: string
          description?: string
          framework_id?: string
          id?: string
          priority?: string
          requirement_code?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_requirements_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_training_records: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          evidence_data: Json
          expiration_date: string | null
          id: string
          organization_id: string | null
          requirement_id: string
          role_template: string | null
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          evidence_data?: Json
          expiration_date?: string | null
          id?: string
          organization_id?: string | null
          requirement_id: string
          role_template?: string | null
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          evidence_data?: Json
          expiration_date?: string | null
          id?: string
          organization_id?: string | null
          requirement_id?: string
          role_template?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_training_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_training_records_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      content_review_queue: {
        Row: {
          assigned_reviewer: string | null
          content_id: string
          content_type: string
          created_at: string
          generated_at: string
          id: string
          priority: string
          review_notes: string | null
          status: string
        }
        Insert: {
          assigned_reviewer?: string | null
          content_id: string
          content_type?: string
          created_at?: string
          generated_at?: string
          id?: string
          priority?: string
          review_notes?: string | null
          status?: string
        }
        Update: {
          assigned_reviewer?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          generated_at?: string
          id?: string
          priority?: string
          review_notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_review_queue_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_content"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnels: {
        Row: {
          created_at: string
          funnel_name: string
          id: string
          step_description: string | null
          step_name: string
          step_number: number
          target_event: string
        }
        Insert: {
          created_at?: string
          funnel_name: string
          id?: string
          step_description?: string | null
          step_name: string
          step_number: number
          target_event: string
        }
        Update: {
          created_at?: string
          funnel_name?: string
          id?: string
          step_description?: string | null
          step_name?: string
          step_number?: number
          target_event?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string | null
          enrollment_date: string | null
          id: string
          lms_enrollment_id: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrollment_date?: string | null
          id?: string
          lms_enrollment_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrollment_date?: string | null
          id?: string
          lms_enrollment_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "professor_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          due_date: string | null
          id: string
          module_id: string | null
          order_index: number | null
          points_possible: number | null
          required: boolean | null
        }
        Insert: {
          course_id?: string | null
          due_date?: string | null
          id?: string
          module_id?: string | null
          order_index?: number | null
          points_possible?: number | null
          required?: boolean | null
        }
        Update: {
          course_id?: string | null
          due_date?: string | null
          id?: string
          module_id?: string | null
          order_index?: number | null
          points_possible?: number | null
          required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "professor_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_bookmarks: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_bookmarks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_bookmarks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_challenges: {
        Row: {
          category: string
          competition_id: string | null
          connection_info: Json
          created_at: string
          description: string
          difficulty: string
          files: Json
          flag_hash: string
          hints: Json
          id: string
          is_active: boolean
          lab_id: string | null
          max_attempts: number | null
          points: number
          requires_instance: boolean
          solve_count: number
          title: string
        }
        Insert: {
          category?: string
          competition_id?: string | null
          connection_info?: Json
          created_at?: string
          description?: string
          difficulty?: string
          files?: Json
          flag_hash: string
          hints?: Json
          id?: string
          is_active?: boolean
          lab_id?: string | null
          max_attempts?: number | null
          points?: number
          requires_instance?: boolean
          solve_count?: number
          title: string
        }
        Update: {
          category?: string
          competition_id?: string | null
          connection_info?: Json
          created_at?: string
          description?: string
          difficulty?: string
          files?: Json
          flag_hash?: string
          hints?: Json
          id?: string
          is_active?: boolean
          lab_id?: string | null
          max_attempts?: number | null
          points?: number
          requires_instance?: boolean
          solve_count?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_challenges_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_challenges_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "cyber_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "ctf_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_comments: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          downvotes: number
          id: string
          is_writeup: boolean
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          is_writeup?: boolean
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          is_writeup?: boolean
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_comments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_comments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_competition_challenges: {
        Row: {
          challenge_id: string
          competition_id: string
          created_at: string
          id: string
          points_override: number | null
        }
        Insert: {
          challenge_id: string
          competition_id: string
          created_at?: string
          id?: string
          points_override?: number | null
        }
        Update: {
          challenge_id?: string
          competition_id?: string
          created_at?: string
          id?: string
          points_override?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ctf_competition_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_competition_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_competition_challenges_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_competition_registrations: {
        Row: {
          competition_id: string
          id: string
          registered_at: string
          status: string
          team_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          registered_at?: string
          status?: string
          team_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          registered_at?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_competition_registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_competition_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_competition_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_competitions: {
        Row: {
          created_at: string
          created_by: string
          description: string
          end_time: string
          id: string
          max_team_size: number
          min_team_size: number
          name: string
          registration_type: string
          scoring_type: string
          start_time: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          end_time?: string
          id?: string
          max_team_size?: number
          min_team_size?: number
          name: string
          registration_type?: string
          scoring_type?: string
          start_time?: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          end_time?: string
          id?: string
          max_team_size?: number
          min_team_size?: number
          name?: string
          registration_type?: string
          scoring_type?: string
          start_time?: string
          status?: string
        }
        Relationships: []
      }
      ctf_hint_unlocks: {
        Row: {
          challenge_id: string
          cost: number
          hint_index: number
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          cost?: number
          hint_index?: number
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          cost?: number
          hint_index?: number
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_hint_unlocks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_hint_unlocks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_submissions: {
        Row: {
          challenge_id: string
          id: string
          is_correct: boolean
          points_awarded: number
          submitted_at: string
          submitted_flag: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          is_correct?: boolean
          points_awarded?: number
          submitted_at?: string
          submitted_flag: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          is_correct?: boolean
          points_awarded?: number
          submitted_at?: string
          submitted_flag?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "ctf_challenges_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_team_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctf_team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "ctf_teams_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_teams: {
        Row: {
          captain_id: string
          competition_id: string | null
          created_at: string
          id: string
          invite_code: string
          name: string
          total_score: number
        }
        Insert: {
          captain_id: string
          competition_id?: string | null
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          total_score?: number
        }
        Update: {
          captain_id?: string
          competition_id?: string | null
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ctf_teams_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      cyber_labs: {
        Row: {
          cpu: number
          created_at: string
          description: string
          difficulty: string
          docker_image: string | null
          duration_minutes: number
          environment_type: string
          id: string
          is_active: boolean
          memory: number
          name: string
        }
        Insert: {
          cpu?: number
          created_at?: string
          description?: string
          difficulty?: string
          docker_image?: string | null
          duration_minutes?: number
          environment_type?: string
          id?: string
          is_active?: boolean
          memory?: number
          name: string
        }
        Update: {
          cpu?: number
          created_at?: string
          description?: string
          difficulty?: string
          docker_image?: string | null
          duration_minutes?: number
          environment_type?: string
          id?: string
          is_active?: boolean
          memory?: number
          name?: string
        }
        Relationships: []
      }
      daily_aggregates: {
        Row: {
          active_users: number
          avg_quiz_score: number | null
          certificates_issued: number
          date: string
          id: string
          modules_completed: number
          new_users: number
          retention_rate: number | null
        }
        Insert: {
          active_users?: number
          avg_quiz_score?: number | null
          certificates_issued?: number
          date: string
          id?: string
          modules_completed?: number
          new_users?: number
          retention_rate?: number | null
        }
        Update: {
          active_users?: number
          avg_quiz_score?: number | null
          certificates_issued?: number
          date?: string
          id?: string
          modules_completed?: number
          new_users?: number
          retention_rate?: number | null
        }
        Relationships: []
      }
      dataset_requests: {
        Row: {
          approved_at: string | null
          created_at: string
          dataset_id: string | null
          email: string
          id: string
          institution: string
          purpose: string
          researcher_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          dataset_id?: string | null
          email: string
          id?: string
          institution?: string
          purpose?: string
          researcher_name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          dataset_id?: string | null
          email?: string
          id?: string
          institution?: string
          purpose?: string
          researcher_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_requests_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      ethics_reviews: {
        Row: {
          comments: string | null
          created_at: string
          decision: string | null
          id: string
          request_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          risk_level: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          request_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_level?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          request_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "dataset_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_sessions: {
        Row: {
          created_at: string | null
          current_attendees: number | null
          duration_minutes: number | null
          expert_avatar: string | null
          expert_bio: string | null
          expert_name: string
          id: string
          max_attendees: number | null
          meeting_link: string | null
          recording_url: string | null
          scheduled_time: string
          status: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          current_attendees?: number | null
          duration_minutes?: number | null
          expert_avatar?: string | null
          expert_bio?: string | null
          expert_name: string
          id?: string
          max_attendees?: number | null
          meeting_link?: string | null
          recording_url?: string | null
          scheduled_time: string
          status?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          current_attendees?: number | null
          duration_minutes?: number | null
          expert_avatar?: string | null
          expert_bio?: string | null
          expert_name?: string
          id?: string
          max_attendees?: number | null
          meeting_link?: string | null
          recording_url?: string | null
          scheduled_time?: string
          status?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      favorite_tips: {
        Row: {
          id: string
          saved_at: string
          tip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          tip_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          tip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_tips_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "weekly_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_comments: {
        Row: {
          comment: string
          created_at: string
          feature_id: string
          id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          feature_id: string
          id?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          feature_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_comments_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_votes: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          user_id: string
          vote_type?: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_votes_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          email: string | null
          feedback_type: string
          id: string
          message: string
          priority: string
          rating: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          message: string
          priority?: string
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          message?: string
          priority?: string
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      forum_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          post_id: string | null
          reply_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          post_id?: string | null
          reply_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          post_id?: string | null
          reply_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          is_closed: boolean | null
          is_pinned: boolean | null
          is_solution_found: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          is_solution_found?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          is_solution_found?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_solution: boolean | null
          parent_reply_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          parent_reply_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          parent_reply_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_activity_reactions: {
        Row: {
          activity_log_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          activity_log_id: string
          created_at?: string
          emoji?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_log_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_activity_reactions_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "user_activity_log"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_activity_visibility: {
        Row: {
          activity_visibility: string
          badges_visibility: string
          friend_request_setting: string
          id: string
          online_status_visibility: string
          profile_visibility: string
          progress_visibility: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_visibility?: string
          badges_visibility?: string
          friend_request_setting?: string
          id?: string
          online_status_visibility?: string
          profile_visibility?: string
          progress_visibility?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_visibility?: string
          badges_visibility?: string
          friend_request_setting?: string
          id?: string
          online_status_visibility?: string
          profile_visibility?: string
          progress_visibility?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          friend_id: string
          friend_nickname: string | null
          id: string
          requested_at: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          friend_id: string
          friend_nickname?: string | null
          id?: string
          requested_at?: string
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          friend_id?: string
          friend_nickname?: string | null
          id?: string
          requested_at?: string
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_questions: {
        Row: {
          correct_answer: string
          correct_count: number | null
          created_at: string | null
          explanation: string | null
          generated_text: string
          id: string
          source_table: string
          template_id: string
          used_count: number | null
          variables_used: Json
          wrong_options: Json
        }
        Insert: {
          correct_answer: string
          correct_count?: number | null
          created_at?: string | null
          explanation?: string | null
          generated_text: string
          id?: string
          source_table?: string
          template_id: string
          used_count?: number | null
          variables_used?: Json
          wrong_options?: Json
        }
        Update: {
          correct_answer?: string
          correct_count?: number | null
          created_at?: string | null
          explanation?: string | null
          generated_text?: string
          id?: string
          source_table?: string
          template_id?: string
          used_count?: number | null
          variables_used?: Json
          wrong_options?: Json
        }
        Relationships: []
      }
      gift_certificates: {
        Row: {
          amount: number
          code: string
          created_at: string | null
          delivery_date: string | null
          id: string
          message: string | null
          purchaser_id: string
          recipient_email: string | null
          recipient_name: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          sender_name: string | null
          status: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          message?: string | null
          purchaser_id: string
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          sender_name?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          message?: string | null
          purchaser_id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          sender_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      incident_simulations: {
        Row: {
          choices: Json
          completed_at: string
          id: string
          max_score: number
          scenario_type: string
          score: number
          user_id: string
        }
        Insert: {
          choices?: Json
          completed_at?: string
          id?: string
          max_score?: number
          scenario_type: string
          score?: number
          user_id: string
        }
        Update: {
          choices?: Json
          completed_at?: string
          id?: string
          max_score?: number
          scenario_type?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      lab_instances: {
        Row: {
          connection_details: Json
          created_at: string
          expires_at: string
          id: string
          instance_id: string
          lab_id: string
          status: string
          user_id: string
        }
        Insert: {
          connection_details?: Json
          created_at?: string
          expires_at?: string
          id?: string
          instance_id?: string
          lab_id: string
          status?: string
          user_id: string
        }
        Update: {
          connection_details?: Json
          created_at?: string
          expires_at?: string
          id?: string
          instance_id?: string
          lab_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_instances_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "cyber_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sessions: {
        Row: {
          commands_log: Json
          end_time: string | null
          id: string
          lab_instance_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          commands_log?: Json
          end_time?: string | null
          id?: string
          lab_instance_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          commands_log?: Json
          end_time?: string | null
          id?: string
          lab_instance_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_sessions_lab_instance_id_fkey"
            columns: ["lab_instance_id"]
            isOneToOne: false
            referencedRelation: "lab_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          is_rtl: boolean | null
          name: string
          native_name: string | null
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_rtl?: boolean | null
          name: string
          native_name?: string | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          is_rtl?: boolean | null
          name?: string
          native_name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          case_study: string | null
          content: Json
          created_at: string
          description: string | null
          difficulty: string
          estimated_minutes: number
          id: string
          infographic_url: string | null
          mini_quiz: Json | null
          order_index: number
          pdf_summary: Json | null
          prerequisites: string[] | null
          recommended_order: number | null
          related_modules: string[] | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          case_study?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_minutes?: number
          id?: string
          infographic_url?: string | null
          mini_quiz?: Json | null
          order_index?: number
          pdf_summary?: Json | null
          prerequisites?: string[] | null
          recommended_order?: number | null
          related_modules?: string[] | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          case_study?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          difficulty?: string
          estimated_minutes?: number
          id?: string
          infographic_url?: string | null
          mini_quiz?: Json | null
          order_index?: number
          pdf_summary?: Json | null
          prerequisites?: string[] | null
          recommended_order?: number | null
          related_modules?: string[] | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      lms_assignments: {
        Row: {
          course_id: string
          created_at: string
          credit_value: number
          due_date: string | null
          id: string
          lms_assignment_id: string | null
          module_id: string
          points_possible: number
        }
        Insert: {
          course_id: string
          created_at?: string
          credit_value?: number
          due_date?: string | null
          id?: string
          lms_assignment_id?: string | null
          module_id: string
          points_possible?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          credit_value?: number
          due_date?: string | null
          id?: string
          lms_assignment_id?: string | null
          module_id?: string
          points_possible?: number
        }
        Relationships: [
          {
            foreignKeyName: "lms_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_connections: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          lms_base_url: string | null
          lms_type: string
          refresh_token: string | null
          settings: Json
          university_id: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          lms_base_url?: string | null
          lms_type?: string
          refresh_token?: string | null
          settings?: Json
          university_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          lms_base_url?: string | null
          lms_type?: string
          refresh_token?: string | null
          settings?: Json
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_connections_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_courses: {
        Row: {
          connection_id: string
          created_at: string
          enrollment_count: number
          id: string
          instructor_id: string | null
          last_synced: string | null
          lms_course_id: string
          name: string
          term: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          enrollment_count?: number
          id?: string
          instructor_id?: string | null
          last_synced?: string | null
          lms_course_id: string
          name: string
          term?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          enrollment_count?: number
          id?: string
          instructor_id?: string | null
          last_synced?: string | null
          lms_course_id?: string
          name?: string
          term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_courses_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "lms_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_grade_sync: {
        Row: {
          assignment_id: string
          created_at: string
          credit_earned: number
          grade: number | null
          id: string
          status: string
          synced_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          credit_earned?: number
          grade?: number | null
          id?: string
          status?: string
          synced_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          credit_earned?: number
          grade?: number | null
          id?: string
          status?: string
          synced_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_grade_sync_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "lms_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          current_mentees: number | null
          expertise_areas: string[] | null
          id: string
          is_active: boolean | null
          max_mentees: number | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          current_mentees?: number | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          max_mentees?: number | null
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          current_mentees?: number | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          max_mentees?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          created_at: string | null
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          meeting_link: string | null
          mentee_id: string
          mentor_id: string
          rating: number | null
          scheduled_time: string
          status: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          mentee_id: string
          mentor_id: string
          rating?: number | null
          scheduled_time: string
          status?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          mentee_id?: string
          mentor_id?: string
          rating?: number | null
          scheduled_time?: string
          status?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_quiz_results: {
        Row: {
          completed_at: string
          id: string
          module_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          module_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          module_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_quiz_results_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_completions: {
        Row: {
          completed_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_feedback: {
        Row: {
          created_at: string | null
          easy_to_understand: string | null
          id: string
          improvement_suggestions: string | null
          module_id: string
          most_helpful: string | null
          rating: number
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string | null
          easy_to_understand?: string | null
          id?: string
          improvement_suggestions?: string | null
          module_id: string
          most_helpful?: string | null
          rating: number
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string | null
          easy_to_understand?: string | null
          id?: string
          improvement_suggestions?: string | null
          module_id?: string
          most_helpful?: string | null
          rating?: number
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "module_feedback_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          module_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          module_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          module_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      module_quizzes: {
        Row: {
          correct_answer: string
          correct_answer_template: string | null
          created_at: string
          explanation: string
          explanation_template: string | null
          generation_count: number | null
          id: string
          is_template: boolean | null
          last_generated_at: string | null
          module_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index: number
          question: string
          template_text: string | null
          variable_definitions: Json | null
          variable_examples: Json | null
          wrong_options_templates: Json | null
        }
        Insert: {
          correct_answer: string
          correct_answer_template?: string | null
          created_at?: string
          explanation: string
          explanation_template?: string | null
          generation_count?: number | null
          id?: string
          is_template?: boolean | null
          last_generated_at?: string | null
          module_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index?: number
          question: string
          template_text?: string | null
          variable_definitions?: Json | null
          variable_examples?: Json | null
          wrong_options_templates?: Json | null
        }
        Update: {
          correct_answer?: string
          correct_answer_template?: string | null
          created_at?: string
          explanation?: string
          explanation_template?: string | null
          generation_count?: number | null
          id?: string
          is_template?: boolean | null
          last_generated_at?: string | null
          module_id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          order_index?: number
          question?: string
          template_text?: string | null
          variable_definitions?: Json | null
          variable_examples?: Json | null
          wrong_options_templates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "module_quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_sections: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          module_id: string
          order_index: number
          title: string
        }
        Insert: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          module_id: string
          order_index?: number
          title: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          module_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_surveys: {
        Row: {
          clarity: string | null
          created_at: string
          id: string
          improvement: string | null
          module_id: string
          most_helpful: string | null
          rating: number
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          clarity?: string | null
          created_at?: string
          id?: string
          improvement?: string | null
          module_id: string
          most_helpful?: string | null
          rating: number
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          clarity?: string | null
          created_at?: string
          id?: string
          improvement?: string | null
          module_id?: string
          most_helpful?: string | null
          rating?: number
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "module_surveys_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_code: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          department: string | null
          id: string
          job_title: string | null
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          department?: string | null
          id?: string
          job_title?: string | null
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          department?: string | null
          id?: string
          job_title?: string | null
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_compliance: {
        Row: {
          compliance_score: number
          created_at: string
          framework_id: string
          id: string
          last_audit_date: string | null
          organization_id: string
          status: string
          target_completion_date: string | null
          updated_at: string
        }
        Insert: {
          compliance_score?: number
          created_at?: string
          framework_id: string
          id?: string
          last_audit_date?: string | null
          organization_id: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Update: {
          compliance_score?: number
          created_at?: string
          framework_id?: string
          id?: string
          last_audit_date?: string | null
          organization_id?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizational_compliance_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizational_compliance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          domain: string | null
          features: Json
          id: string
          max_users: number
          name: string
          plan_type: Database["public"]["Enums"]["org_plan"]
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          features?: Json
          id?: string
          max_users?: number
          name: string
          plan_type?: Database["public"]["Enums"]["org_plan"]
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          features?: Json
          id?: string
          max_users?: number
          name?: string
          plan_type?: Database["public"]["Enums"]["org_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      phishing_campaigns: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          scheduled_at: string | null
          status: string
          target_user_ids: Json
          template_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          id?: string
          name: string
          scheduled_at?: string | null
          status?: string
          target_user_ids?: Json
          template_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          status?: string
          target_user_ids?: Json
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phishing_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "phishing_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      phishing_results: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          credentials_submitted: boolean
          email_sent_at: string | null
          id: string
          opened_at: string | null
          reported_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          credentials_submitted?: boolean
          email_sent_at?: string | null
          id?: string
          opened_at?: string | null
          reported_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          credentials_submitted?: boolean
          email_sent_at?: string | null
          id?: string
          opened_at?: string | null
          reported_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phishing_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "phishing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      phishing_templates: {
        Row: {
          category: string
          content_html: string
          created_at: string
          created_by: string
          difficulty: string
          id: string
          name: string
          red_flags: Json | null
          sender_email: string
          sender_name: string
          subject: string
        }
        Insert: {
          category?: string
          content_html?: string
          created_at?: string
          created_by: string
          difficulty?: string
          id?: string
          name: string
          red_flags?: Json | null
          sender_email?: string
          sender_name?: string
          subject?: string
        }
        Update: {
          category?: string
          content_html?: string
          created_at?: string
          created_by?: string
          difficulty?: string
          id?: string
          name?: string
          red_flags?: Json | null
          sender_email?: string
          sender_name?: string
          subject?: string
        }
        Relationships: []
      }
      points_log: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      professor_courses: {
        Row: {
          code: string | null
          created_at: string | null
          end_date: string | null
          id: string
          lms_course_id: string | null
          name: string
          professor_id: string
          semester: string | null
          settings: Json | null
          start_date: string | null
          year: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          lms_course_id?: string | null
          name: string
          professor_id: string
          semester?: string | null
          settings?: Json | null
          start_date?: string | null
          year?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          lms_course_id?: string | null
          name?: string
          professor_id?: string
          semester?: string | null
          settings?: Json | null
          start_date?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_courses_lms_course_id_fkey"
            columns: ["lms_course_id"]
            isOneToOne: false
            referencedRelation: "lms_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          ctf_points: number
          ctf_solved_count: number
          cyber_score: number | null
          display_name: string | null
          email: string
          graduation_year: number | null
          id: string
          level: string | null
          location: string | null
          name: string
          notification_settings: Json | null
          phone: string | null
          preferences: Json | null
          referral_code: string | null
          student_discount_applied: boolean | null
          student_verified: boolean | null
          total_points: number | null
          university_name: string | null
          updated_at: string
          user_id: string
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          ctf_points?: number
          ctf_solved_count?: number
          cyber_score?: number | null
          display_name?: string | null
          email: string
          graduation_year?: number | null
          id?: string
          level?: string | null
          location?: string | null
          name: string
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          referral_code?: string | null
          student_discount_applied?: boolean | null
          student_verified?: boolean | null
          total_points?: number | null
          university_name?: string | null
          updated_at?: string
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          ctf_points?: number
          ctf_solved_count?: number
          cyber_score?: number | null
          display_name?: string | null
          email?: string
          graduation_year?: number | null
          id?: string
          level?: string | null
          location?: string | null
          name?: string
          notification_settings?: Json | null
          phone?: string | null
          preferences?: Json | null
          referral_code?: string | null
          student_discount_applied?: boolean | null
          student_verified?: boolean | null
          total_points?: number | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          correct_answer_template: string | null
          created_at: string
          difficulty: string | null
          explanation: string | null
          explanation_template: string | null
          generation_count: number | null
          id: string
          image_url: string | null
          is_template: boolean | null
          last_generated_at: string | null
          options: Json
          order_index: number
          question_text: string
          scenario: string | null
          template_text: string | null
          time_limit: number | null
          variable_definitions: Json | null
          variable_examples: Json | null
          wrong_options_templates: Json | null
        }
        Insert: {
          correct_answer: string
          correct_answer_template?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          explanation_template?: string | null
          generation_count?: number | null
          id?: string
          image_url?: string | null
          is_template?: boolean | null
          last_generated_at?: string | null
          options?: Json
          order_index?: number
          question_text: string
          scenario?: string | null
          template_text?: string | null
          time_limit?: number | null
          variable_definitions?: Json | null
          variable_examples?: Json | null
          wrong_options_templates?: Json | null
        }
        Update: {
          correct_answer?: string
          correct_answer_template?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          explanation_template?: string | null
          generation_count?: number | null
          id?: string
          image_url?: string | null
          is_template?: boolean | null
          last_generated_at?: string | null
          options?: Json
          order_index?: number
          question_text?: string
          scenario?: string | null
          template_text?: string | null
          time_limit?: number | null
          variable_definitions?: Json | null
          variable_examples?: Json | null
          wrong_options_templates?: Json | null
        }
        Relationships: []
      }
      quiz_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          reviewed_at: string | null
          status: string
          suggested_questions: Json | null
          title: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          suggested_questions?: Json | null
          title: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          suggested_questions?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_granted: boolean | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      regional_hub_members: {
        Row: {
          hub_id: string | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          hub_id?: string | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          hub_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_hub_members_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "regional_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_hubs: {
        Row: {
          created_at: string | null
          description: string | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          language_code: string | null
          member_count: number | null
          region_code: string
          region_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          language_code?: string | null
          member_count?: number | null
          region_code: string
          region_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          language_code?: string | null
          member_count?: number | null
          region_code?: string
          region_name?: string
        }
        Relationships: []
      }
      reputation_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      research_datasets: {
        Row: {
          anonymization_method: string
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          record_count: number
          status: string
        }
        Insert: {
          anonymization_method?: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          name: string
          record_count?: number
          status?: string
        }
        Update: {
          anonymization_method?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          record_count?: number
          status?: string
        }
        Relationships: []
      }
      research_opt_outs: {
        Row: {
          id: string
          opted_out_at: string
          reason: string | null
          user_id: string
        }
        Insert: {
          id?: string
          opted_out_at?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          id?: string
          opted_out_at?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_publications: {
        Row: {
          abstract: string
          authors: string
          created_at: string
          dataset_used: string | null
          doi: string | null
          id: string
          institution: string
          journal: string
          status: string
          submitted_by: string | null
          tags: string[] | null
          title: string
          year: number
        }
        Insert: {
          abstract?: string
          authors: string
          created_at?: string
          dataset_used?: string | null
          doi?: string | null
          id?: string
          institution?: string
          journal?: string
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          year?: number
        }
        Update: {
          abstract?: string
          authors?: string
          created_at?: string
          dataset_used?: string | null
          doi?: string | null
          id?: string
          institution?: string
          journal?: string
          status?: string
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          is_hidden: boolean | null
          rating: number
          review_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_hidden?: boolean | null
          rating: number
          review_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_hidden?: boolean | null
          rating?: number
          review_text?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          created_at: string
          email: string
          id: string
          reason: string
          status: string
          university: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reason?: string
          status?: string
          university?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reason?: string
          status?: string
          university?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_scores: {
        Row: {
          calculated_at: string
          id: string
          mfa_score: number
          modules_score: number
          overall_score: number
          password_score: number
          phishing_score: number
          settings_score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          id?: string
          mfa_score?: number
          modules_score?: number
          overall_score?: number
          password_score?: number
          phishing_score?: number
          settings_score?: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          id?: string
          mfa_score?: number
          modules_score?: number
          overall_score?: number
          password_score?: number
          phishing_score?: number
          settings_score?: number
          user_id?: string
        }
        Relationships: []
      }
      session_questions: {
        Row: {
          answered: boolean | null
          created_at: string | null
          id: string
          question: string
          session_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answered?: boolean | null
          created_at?: string | null
          id?: string
          question: string
          session_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answered?: boolean | null
          created_at?: string | null
          id?: string
          question?: string
          session_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "expert_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_registrations: {
        Row: {
          attended: boolean | null
          id: string
          registered_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          id?: string
          registered_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          id?: string
          registered_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "expert_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      spaced_repetition_items: {
        Row: {
          created_at: string
          easiness_factor: number
          id: string
          interval_days: number
          last_reviewed_at: string | null
          module_id: string | null
          next_review_at: string
          quality_history: number[] | null
          question_id: string | null
          repetitions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          module_id?: string | null
          next_review_at?: string
          quality_history?: number[] | null
          question_id?: string | null
          repetitions?: number
          user_id: string
        }
        Update: {
          created_at?: string
          easiness_factor?: number
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          module_id?: string | null
          next_review_at?: string
          quality_history?: number[] | null
          question_id?: string | null
          repetitions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaced_repetition_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_verification_tokens: {
        Row: {
          created_at: string | null
          email_sent_to: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent_to: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent_to?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_messages: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          group_id: string
          id: string
          meeting_link: string | null
          scheduled_time: string
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          group_id: string
          id?: string
          meeting_link?: string | null
          scheduled_time: string
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          group_id?: string
          id?: string
          meeting_link?: string | null
          scheduled_time?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_group_sessions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          join_code: string | null
          max_members: number | null
          module_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          join_code?: string | null
          max_members?: number | null
          module_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          join_code?: string | null
          max_members?: number | null
          module_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          max_users: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          student_price_monthly: number | null
          student_price_yearly: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          student_price_monthly?: number | null
          student_price_yearly?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          student_price_monthly?: number | null
          student_price_yearly?: number | null
        }
        Relationships: []
      }
      threat_intel_entries: {
        Row: {
          created_at: string
          description: string
          external_url: string | null
          id: string
          is_active: boolean
          published_at: string
          related_module_ids: string[] | null
          severity: string
          source: string
          threat_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          external_url?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          related_module_ids?: string[] | null
          severity?: string
          source?: string
          threat_type?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          external_url?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          related_module_ids?: string[] | null
          severity?: string
          source?: string
          threat_type?: string
          title?: string
        }
        Relationships: []
      }
      transcript_records: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          credits_earned: number | null
          grade_percent: number | null
          id: string
          letter_grade: string | null
          module_id: string | null
          user_id: string
          verification_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          credits_earned?: number | null
          grade_percent?: number | null
          id?: string
          letter_grade?: string | null
          module_id?: string | null
          user_id: string
          verification_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          credits_earned?: number | null
          grade_percent?: number | null
          id?: string
          letter_grade?: string | null
          module_id?: string | null
          user_id?: string
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcript_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "professor_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_records_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_glossary: {
        Row: {
          category: string | null
          context_notes: string | null
          created_at: string | null
          id: string
          language_code: string
          term: string
          translation: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          context_notes?: string | null
          created_at?: string | null
          id?: string
          language_code: string
          term: string
          translation: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          context_notes?: string | null
          created_at?: string | null
          id?: string
          language_code?: string
          term?: string
          translation?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      translation_keys: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key_name: string
          module: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key_name: string
          module?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key_name?: string
          module?: string | null
        }
        Relationships: []
      }
      translation_memory: {
        Row: {
          created_at: string | null
          id: string
          last_used: string | null
          source_language: string | null
          source_text: string
          target_language: string
          target_text: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          source_language?: string | null
          source_text: string
          target_language: string
          target_text: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used?: string | null
          source_language?: string | null
          source_text?: string
          target_language?: string
          target_text?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          key_id: string | null
          language_code: string
          reviewed_by: string | null
          translated_by: string | null
          translated_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          key_id?: string | null
          language_code: string
          reviewed_by?: string | null
          translated_by?: string | null
          translated_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          key_id?: string | null
          language_code?: string
          reviewed_by?: string | null
          translated_by?: string | null
          translated_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "translation_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      translator_applications: {
        Row: {
          created_at: string | null
          id: string
          languages: string[]
          motivation: string | null
          sample_translation: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          languages: string[]
          motivation?: string | null
          sample_translation?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          languages?: string[]
          motivation?: string | null
          sample_translation?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      university_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_verified: boolean | null
          university_name: string
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_verified?: boolean | null
          university_name: string
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_verified?: boolean | null
          university_name?: string
        }
        Relationships: []
      }
      university_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "university_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      university_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          member_count: number | null
          university_domain: string | null
          university_name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          university_domain?: string | null
          university_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          university_domain?: string | null
          university_name?: string
        }
        Relationships: []
      }
      university_partnerships: {
        Row: {
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          current_lms: string | null
          department: string | null
          estimated_students: string | null
          id: string
          interests: string[] | null
          status: string
          university_name: string
          user_id: string | null
        }
        Insert: {
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          current_lms?: string | null
          department?: string | null
          estimated_students?: string | null
          id?: string
          interests?: string[] | null
          status?: string
          university_name: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          current_lms?: string | null
          department?: string | null
          estimated_students?: string | null
          id?: string
          interests?: string[] | null
          status?: string
          university_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          module_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          period_start: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          period_start: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          period_start?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          module_id: string | null
          page_url: string | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          page_url?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          page_url?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_events_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_preferences: {
        Row: {
          id: string
          learning_goal: string | null
          personalization_enabled: boolean
          preferred_difficulty: string
          preferred_session_minutes: number
          preferred_time_of_day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          learning_goal?: string | null
          personalization_enabled?: boolean
          preferred_difficulty?: string
          preferred_session_minutes?: number
          preferred_time_of_day?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          learning_goal?: string | null
          personalization_enabled?: boolean
          preferred_difficulty?: string
          preferred_session_minutes?: number
          preferred_time_of_day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_module_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_accessed: string
          module_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_accessed?: string
          module_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_accessed?: string
          module_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          module_id: string
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          module_id: string
          quiz_id: string
          selected_answer: string
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          module_id?: string
          quiz_id?: string
          selected_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "module_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_seen_questions: {
        Row: {
          generated_question_id: string
          id: string
          seen_at: string | null
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          generated_question_id: string
          id?: string
          seen_at?: string | null
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          generated_question_id?: string
          id?: string
          seen_at?: string | null
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_seen_questions_generated_question_id_fkey"
            columns: ["generated_question_id"]
            isOneToOne: false
            referencedRelation: "generated_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          days_since_last_visit: number | null
          id: string
          last_activity_date: string | null
          segment_name: string
          total_modules_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          days_since_last_visit?: number | null
          id?: string
          last_activity_date?: string | null
          segment_name?: string
          total_modules_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          days_since_last_visit?: number | null
          id?: string
          last_activity_date?: string | null
          segment_name?: string
          total_modules_completed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_freeze_month: number | null
          streak_freezes_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_freeze_month?: number | null
          streak_freezes_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_freeze_month?: number | null
          streak_freezes_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan_id: string | null
          scholarship_approved: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          scholarship_approved?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          scholarship_approved?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tip_history: {
        Row: {
          id: string
          marked_helpful: boolean | null
          tip_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          marked_helpful?: boolean | null
          tip_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          marked_helpful?: boolean | null
          tip_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tip_history_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "weekly_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_tips: {
        Row: {
          action_step: string | null
          category: string | null
          created_at: string
          detailed_text: string | null
          difficulty: string | null
          headline: string | null
          helpful_count: number | null
          id: string
          is_banner: boolean | null
          risk_level: string | null
          tags: string[] | null
          tip_text: string
          updated_at: string
          viewed_count: number | null
          week_number: number
          why_it_matters: string | null
          year: number
        }
        Insert: {
          action_step?: string | null
          category?: string | null
          created_at?: string
          detailed_text?: string | null
          difficulty?: string | null
          headline?: string | null
          helpful_count?: number | null
          id?: string
          is_banner?: boolean | null
          risk_level?: string | null
          tags?: string[] | null
          tip_text: string
          updated_at?: string
          viewed_count?: number | null
          week_number: number
          why_it_matters?: string | null
          year: number
        }
        Update: {
          action_step?: string | null
          category?: string | null
          created_at?: string
          detailed_text?: string | null
          difficulty?: string | null
          headline?: string | null
          helpful_count?: number | null
          id?: string
          is_banner?: boolean | null
          risk_level?: string | null
          tags?: string[] | null
          tip_text?: string
          updated_at?: string
          viewed_count?: number | null
          week_number?: number
          why_it_matters?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      community_challenges_safe: {
        Row: {
          category: string | null
          connection_info: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          downvotes: number | null
          featured: boolean | null
          file_attachments: Json | null
          hints: Json | null
          id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          connection_info?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          downvotes?: number | null
          featured?: boolean | null
          file_attachments?: Json | null
          hints?: Json | null
          id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          connection_info?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          downvotes?: number | null
          featured?: boolean | null
          file_attachments?: Json | null
          hints?: Json | null
          id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ctf_challenges_public: {
        Row: {
          category: string | null
          competition_id: string | null
          connection_info: Json | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          files: Json | null
          hints: Json | null
          id: string | null
          is_active: boolean | null
          lab_id: string | null
          max_attempts: number | null
          points: number | null
          requires_instance: boolean | null
          solve_count: number | null
          title: string | null
        }
        Insert: {
          category?: string | null
          competition_id?: string | null
          connection_info?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          files?: Json | null
          hints?: Json | null
          id?: string | null
          is_active?: boolean | null
          lab_id?: string | null
          max_attempts?: number | null
          points?: number | null
          requires_instance?: boolean | null
          solve_count?: number | null
          title?: string | null
        }
        Update: {
          category?: string | null
          competition_id?: string | null
          connection_info?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          files?: Json | null
          hints?: Json | null
          id?: string | null
          is_active?: boolean | null
          lab_id?: string | null
          max_attempts?: number | null
          points?: number | null
          requires_instance?: boolean | null
          solve_count?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ctf_challenges_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctf_challenges_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "cyber_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      ctf_teams_public: {
        Row: {
          captain_id: string | null
          competition_id: string | null
          created_at: string | null
          id: string | null
          invite_code: string | null
          name: string | null
          total_score: number | null
        }
        Insert: {
          captain_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          id?: string | null
          invite_code?: never
          name?: string | null
          total_score?: number | null
        }
        Update: {
          captain_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          id?: string | null
          invite_code?: never
          name?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ctf_teams_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "ctf_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_profiles_safe: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          ctf_points: number | null
          ctf_solved_count: number | null
          cyber_score: number | null
          display_name: string | null
          id: string | null
          level: string | null
          name: string | null
          total_points: number | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          ctf_points?: number | null
          ctf_solved_count?: number | null
          cyber_score?: number | null
          display_name?: string | null
          id?: string | null
          level?: string | null
          name?: string | null
          total_points?: number | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          ctf_points?: number | null
          ctf_solved_count?: number | null
          cyber_score?: number | null
          display_name?: string | null
          id?: string | null
          level?: string | null
          name?: string | null
          total_points?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      gift_certificates_redeemer_safe: {
        Row: {
          amount: number | null
          code: string | null
          created_at: string | null
          delivery_date: string | null
          id: string | null
          purchaser_id: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string | null
          purchaser_id?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          code?: string | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string | null
          purchaser_id?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      leaderboard_view: {
        Row: {
          level: string | null
          name: string | null
          rank: number | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
      quiz_questions_public: {
        Row: {
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string | null
          image_url: string | null
          options: Json | null
          order_index: number | null
          question_text: string | null
          scenario: string | null
          time_limit: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          question_text?: string | null
          scenario?: string | null
          time_limit?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string | null
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          question_text?: string | null
          scenario?: string | null
          time_limit?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_friends: {
        Args: { _friend_id: string; _user_id: string }
        Returns: boolean
      }
      calculate_user_level: { Args: { points: number }; Returns: string }
      check_and_award_badges: { Args: never; Returns: Json }
      complete_module: { Args: { p_module_id: string }; Returns: Json }
      generate_certificate: { Args: never; Returns: Json }
      get_module_feedback_stats: {
        Args: { p_module_id: string }
        Returns: {
          avg_rating: number
          total_ratings: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_generated_question_stats: {
        Args: { p_id: string; p_was_correct: boolean }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { p_source_table?: string; p_template_id: string }
        Returns: undefined
      }
      insert_generated_question: {
        Args: {
          p_correct_answer: string
          p_explanation: string
          p_generated_text: string
          p_source_table: string
          p_template_id: string
          p_variables_used: Json
          p_wrong_options: Json
        }
        Returns: string
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_manager: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      submit_quiz_result:
        | { Args: { p_answers: Json }; Returns: Json }
        | {
            Args: {
              p_answers: Json
              p_score: number
              p_total_questions: number
            }
            Returns: Json
          }
      submit_review: {
        Args: { p_rating: number; p_review_text: string }
        Returns: Json
      }
      verify_certificate: {
        Args: { p_verification_id: string }
        Returns: {
          certificate_number: string
          is_valid: boolean
          issued_at: string
          student_name: string
          verification_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      org_plan: "free" | "pro" | "enterprise"
      org_role: "member" | "manager" | "admin" | "owner"
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
      org_plan: ["free", "pro", "enterprise"],
      org_role: ["member", "manager", "admin", "owner"],
    },
  },
} as const
