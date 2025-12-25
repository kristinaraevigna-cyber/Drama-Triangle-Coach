export type DramaRole = 'persecutor' | 'rescuer' | 'victim'
export type CompassionRole = 'p_plus' | 's_plus' | 'v_plus'
export type IntimacyLevel = 'silence' | 'top' | 'poci' | 'you_me' | 'us'
export type SessionType = 'quick_checkin' | 'drama_exploration' | 'compassion_practice' | 'seven_ps' | 'relationship_repair' | 'free_session'
export type LanguageCode = 'en' | 'fr' | 'es' | 'pt' | 'de'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  language: LanguageCode
  onboarding_completed: boolean
  current_streak: number
  total_sessions: number
  created_at: string
}

export interface Concept {
  id: number
  slug: string
  name_key: string
  description_key: string
  display_order: number
  estimated_minutes: number
  icon: string
  color: string
}

export interface CoachingSession {
  id: string
  user_id: string
  session_type: SessionType
  status: 'active' | 'completed' | 'abandoned'
  message_count: number
  started_at: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
