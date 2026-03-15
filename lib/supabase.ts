import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For server-side usage in Pages Router API routes
// Note: next/headers is NOT compatible with Pages Router
export function createServerSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For pages API routes (doesn't use next/headers)
export function createPagesSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton supabase client instance used by API routes
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

// Types for Brazilian user profile
export interface BrazilianUserProfile {
  id: string
  display_name?: string
  email: string
  phone?: string
  cpf?: string // Encrypted CPF
  timezone: string
  language: string
  currency: string
  notification_preferences: Record<string, any>
  ai_preferences: Record<string, any>
  consent_version: string
  marketing_consent: boolean
  ai_processing_consent: boolean
  data_retention_until?: string
  created_at: string
  updated_at: string
  last_active_at: string
  deleted_at?: string
  deletion_reason?: string
}

// Types for groups
export interface Group {
  id: string
  name: string
  description?: string
  group_type: 'casual' | 'recurring' | 'event' | 'travel'
  default_split_method: 'equal' | 'weighted' | 'custom'
  currency: string
  created_by: string
  status: 'active' | 'archived' | 'deleted'
  ai_enabled: boolean
  ai_suggestions_enabled: boolean
  created_at: string
  updated_at: string
  archived_at?: string
}

// Types for conversations
export interface Conversation {
  id: string
  group_id?: string
  user_id: string
  title?: string
  conversation_type: 'general' | 'expense_split' | 'group_admin' | 'ai_help'
  context_summary?: string
  ai_model_used?: string
  total_tokens_used: number
  total_cost_brl: number
  timezone: string
  language: string
  contains_pii: boolean
  data_retention_until?: string
  status: 'active' | 'archived' | 'deleted'
  created_at: string
  updated_at: string
  last_message_at: string
}

// Types for messages
export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used?: number
  model_used?: string
  cost_brl?: number
  processing_time_ms?: number
  message_type: 'text' | 'expense_suggestion' | 'split_calculation'
  metadata: Record<string, any>
  contains_pii: boolean
  anonymized: boolean
  created_at: string
} 