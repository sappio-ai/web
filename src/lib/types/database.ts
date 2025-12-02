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
      admin_users: {
        Row: {
          granted_at: string
          note: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          note?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chunks: {
        Row: {
          content: string
          id: number
          material_id: string
          meta_json: Json | null
          order_index: number
          token_count: number | null
          vector: string | null
        }
        Insert: {
          content: string
          id?: number
          material_id: string
          meta_json?: Json | null
          order_index?: number
          token_count?: number | null
          vector?: string | null
        }
        Update: {
          content?: string
          id?: number
          material_id?: string
          meta_json?: Json | null
          order_index?: number
          token_count?: number | null
          vector?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chunks_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          event: string
          id: number
          props_json: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          props_json?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          props_json?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          due_at: string | null
          ease: number | null
          front: string
          id: string
          interval_days: number | null
          kind: string | null
          lapses: number | null
          reps: number | null
          study_pack_id: string
          topic: string | null
        }
        Insert: {
          back: string
          created_at?: string
          due_at?: string | null
          ease?: number | null
          front: string
          id?: string
          interval_days?: number | null
          kind?: string | null
          lapses?: number | null
          reps?: number | null
          study_pack_id: string
          topic?: string | null
        }
        Update: {
          back?: string
          created_at?: string
          due_at?: string | null
          ease?: number | null
          front?: string
          id?: string
          interval_days?: number | null
          kind?: string | null
          lapses?: number | null
          reps?: number | null
          study_pack_id?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_study_pack_id_fkey"
            columns: ["study_pack_id"]
            isOneToOne: false
            referencedRelation: "study_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          id: string
          kind: string
          meta_json: Json | null
          page_count: number | null
          source_url: string | null
          status: string
          storage_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          meta_json?: Json | null
          page_count?: number | null
          source_url?: string | null
          status?: string
          storage_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          meta_json?: Json | null
          page_count?: number | null
          source_url?: string | null
          status?: string
          storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mindmap_nodes: {
        Row: {
          content: string | null
          id: string
          mindmap_id: string
          order_index: number
          parent_id: string | null
          source_chunk_ids: number[] | null
          title: string
        }
        Insert: {
          content?: string | null
          id?: string
          mindmap_id: string
          order_index?: number
          parent_id?: string | null
          source_chunk_ids?: number[] | null
          title: string
        }
        Update: {
          content?: string | null
          id?: string
          mindmap_id?: string
          order_index?: number
          parent_id?: string | null
          source_chunk_ids?: number[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mindmap_nodes_mindmap_id_fkey"
            columns: ["mindmap_id"]
            isOneToOne: false
            referencedRelation: "mindmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mindmap_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mindmap_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mindmaps: {
        Row: {
          created_at: string
          id: string
          layout_json: Json
          study_pack_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout_json: Json
          study_pack_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout_json?: Json
          study_pack_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mindmaps_study_pack_id_fkey"
            columns: ["study_pack_id"]
            isOneToOne: false
            referencedRelation: "study_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          status: string
          study_pack_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          message: string
          status?: string
          study_pack_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          status?: string
          study_pack_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_study_pack_id_fkey"
            columns: ["study_pack_id"]
            isOneToOne: false
            referencedRelation: "study_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          provider: string
          provider_ref: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string
          provider_ref?: string | null
          status: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_items: {
        Row: {
          answer: string
          explanation: string | null
          id: string
          options_json: Json | null
          question: string
          quiz_id: string
          topic: string | null
          type: string
        }
        Insert: {
          answer: string
          explanation?: string | null
          id?: string
          options_json?: Json | null
          question: string
          quiz_id: string
          topic?: string | null
          type: string
        }
        Update: {
          answer?: string
          explanation?: string | null
          id?: string
          options_json?: Json | null
          question?: string
          quiz_id?: string
          topic?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_items_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          detail_json: Json | null
          duration_s: number | null
          id: string
          quiz_id: string
          score: number
          taken_at: string
          user_id: string
        }
        Insert: {
          detail_json?: Json | null
          duration_s?: number | null
          id?: string
          quiz_id: string
          score: number
          taken_at?: string
          user_id: string
        }
        Update: {
          detail_json?: Json | null
          duration_s?: number | null
          id?: string
          quiz_id?: string
          score?: number
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          config_json: Json | null
          created_at: string
          id: string
          study_pack_id: string
        }
        Insert: {
          config_json?: Json | null
          created_at?: string
          id?: string
          study_pack_id: string
        }
        Update: {
          config_json?: Json | null
          created_at?: string
          id?: string
          study_pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_study_pack_id_fkey"
            columns: ["study_pack_id"]
            isOneToOne: false
            referencedRelation: "study_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      study_packs: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          stats_json: Json | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          stats_json?: Json | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          stats_json?: Json | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_packs_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string | null
          plan: string
          plan_expires_at: string | null
          role: string
          username: string | null
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          locale?: string | null
          plan?: string
          plan_expires_at?: string | null
          role?: string
          username?: string | null
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          plan?: string
          plan_expires_at?: string | null
          role?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
