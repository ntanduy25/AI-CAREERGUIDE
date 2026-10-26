export type UserRole = 'STUDENT' | 'ADMIN';

export interface UserProfileDetails {
  phone?: string;
  date_of_birth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác' | string;
  school_name?: string;
  city_province?: string;
  grade_level?: 'Lớp 10' | 'Lớp 11' | 'Lớp 12' | string;
  target_admission_block?: string;
  career_goal?: string;
  privacy_ai_shield_enabled?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  profile?: UserProfileDetails;
}

export interface UserConsent {
  id: string;
  user_id: string;
  consent_purpose: string;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
  granted_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 6 RIASEC Dimensions
export type RIASECDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RIASECVector {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface RIASECQuestion {
  id: number;
  dimension: RIASECDimension;
  dimension_name: string;
  question_text: string;
  icon: string;
}

export interface CognitivePreferenceItem {
  key: string;
  title: string;
  description: string;
  option_a: { label: string; value: string; desc: string };
  option_b: { label: string; value: string; desc: string };
}

export interface SubjectGrade {
  subject: string;
  score: number;
}

export interface AdmissionBlockScore {
  block_code: string;
  block_name: string;
  subjects: string[];
  total_score: number;
  z_score: number;
  percentile: number;
}

export interface TopSupportingFactor {
  factor_type: 'RIASEC' | 'ACADEMIC' | 'PREFERENCE';
  factor_title: string;
  factor_description: string;
  contribution_score: number;
}

export interface CompetencyGapItem {
  skill_id: string;
  skill_name: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  remedy_action: string;
}

export interface MajorRecommendation {
  major_code: string;
  major_name: string;
  category_name: string;
  overall_score: number;
  riasec_score: number;
  academic_score: number;
  preference_score: number;
  riasec_vector: RIASECVector;
  top_supporting_factors: TopSupportingFactor[];
  missing_skills: CompetencyGapItem[];
  admitted_blocks: string[];
  industry_outlook?: string;
}

export interface BroadFieldRecommendation {
  field_id: string;
  field_name: string;
  field_score: number;
  matching_traits: string;
  dominant_dimension: string;
  recommended_blocks: string[];
  description: string;
  majors: MajorRecommendation[];
}

export interface RecommendationHistoryItem {
  id: string;
  created_at: string;
  dominant_traits: string[];
  riasec_vector: RIASECVector;
  top_fields: {
    field_name: string;
    field_score: number;
    matching_traits: string;
    top_major_names: string[];
  }[];
  full_broad_fields: BroadFieldRecommendation[];
}

export interface SavedRoadmapItem {
  id: string;
  major_code: string;
  major_name: string;
  category_name: string;
  overall_score?: number;
  created_at: string;
  last_studied_at?: string;
  progress_percent: number;
  completed_action_keys: string[];
  prerequisite_knowledge: string[];
  target_skills: string[];
}

export interface RoadmapMilestone {
  step: number;
  title: string;
  description: string;
  duration_weeks: number;
  learning_objectives: string[];
  actions: string[];
  is_completed?: boolean;
}

export interface ReferenceMaterial {
  title: string;
  author_or_institution: string;
  url: string;
  material_type: string;
}

export interface MajorRoadmap {
  id: string;
  major_code: string;
  title: string;
  version: string;
  is_fallback: boolean;
  roadmap_data: {
    milestones: RoadmapMilestone[];
    prerequisite_knowledge: string[];
    target_skills: string[];
    reference_materials: ReferenceMaterial[];
    source_title: string;
    source_url: string;
    source_page?: string;
  };
}

export interface PersonalizedScheduleTask {
  week_number: number;
  focus_skill: string;
  tasks: string[];
  recommended_reading: string;
  estimated_hours: number;
}

export interface GuidancePersonalizationResponse {
  major_code: string;
  personalization_summary: string;
  schedule: PersonalizedScheduleTask[];
  is_fallback: boolean;
}

export type StagingStreamType = 'STREAM_A_MOET' | 'STREAM_B_ROADMAP';
export type StagingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StagingRecord {
  id: string;
  stream_type: StagingStreamType;
  status: StagingStatus;
  major_code?: string;
  content_hash: string;
  raw_content?: string;
  extracted_payload: Record<string, any>;
  source_title: string;
  source_url: string;
  source_page?: string;
  retrieved_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

// ==========================================
// CENTRALIZED VOCATIONAL ASSESSMENT TYPES (FR02, FR04 - CIRCULAR 74/2026/TT-BGDĐT)
// ==========================================

export interface LikertScaleOption {
  value: number;
  label: string;
  emoji: string;
  weight: number;
}

export interface RIASECGroupMeta {
  dimension: string;
  step_index: number;
  name_vi: string;
  name_en: string;
  badge: string;
  description: string;
  related_moet_field_codes: string[];
}

export interface CognitiveQuestionOption {
  id?: string;
  option_key: string;
  trait_code: string;
  title: string;
  description: string;
  related_moet_field_codes: string[];
  order_index: number;
}

export interface AssessmentQuestionItem {
  id?: string;
  code: string;
  category?: 'RIASEC' | 'COGNITIVE' | string;
  dimension?: string;
  dimension_badge?: string;
  dimension_key?: string;
  title?: string;
  subtitle?: string;
  domain_tag?: string;
  icon_name?: string;
  question_text?: string;
  order_index?: number;
  order?: number;
  xp_reward?: number;
  options?: CognitiveQuestionOption[];
}

export interface AssessmentQuestionSetConfig {
  xp_per_question: number;
  completion_bonus_xp: number;
  estimated_minutes: number;
  questions_per_riasec_page: number;
  total_riasec_questions: number;
  total_cognitive_questions: number;
  weights: {
    riasec: number;
    academic: number;
    cognitive_preference: number;
  };
}

export interface QAPersonaPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  target_moet_majors: Array<{
    major_code: string;
    major_name: string;
  }>;
  riasec_answers: Record<string, number>;
  cognitive_answers: Record<string, string>;
}

export interface ActiveQuestionSet {
  project?: string;
  set_id: string;
  set_code: string;
  version: string;
  title: string;
  circular_ref: string;
  config: AssessmentQuestionSetConfig;
  likert_scale: LikertScaleOption[];
  riasec_groups: RIASECGroupMeta[];
  riasec_questions: AssessmentQuestionItem[];
  cognitive_questions: AssessmentQuestionItem[];
  qa_persona_presets: QAPersonaPreset[];
}

export interface AssessmentSubmissionPayload {
  set_id?: string;
  riasec_answers: Record<string, number>;
  cognitive_answers: Record<string, string>;
  completion_time_seconds?: number;
}

export interface AssessmentSubmissionResult {
  submission_id: string;
  riasec_vector: RIASECVector;
  riasec_raw_scores: Record<string, number>;
  cognitive_traits: Record<string, string>;
  dominant_traits: string[];
  xp_earned: number;
  summary: string;
  completed_at: string;
}
export interface MajorItem {
  id?: string;
  major_code: string;
  name: string;
  category: string;
  degree_level?: string;
  blocks: string[];
  careers: string[];
  riasec: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  cognitive?: Record<string, string>;
  outlook: string;
  description?: string;
  is_active?: boolean;
}

// Diagnostic Skill Checks (FR03)
export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface DiagnosticQuiz {
  id: string;
  skill_code: string;
  title: string;
  domain: string;
  badge_name: string;
  icon: string;
  duration_minutes: number;
  description: string;
  prerequisite_for: string[];
  questions: DiagnosticQuestion[];
}

export interface DiagnosticTestRecord {
  skill_code: string;
  quiz_id: string;
  score: number; // 0.0 - 10.0 scale
  percentage: number; // 0 - 100%
  is_passed: boolean; // >= 70%
  total_questions: number;
  correct_answers: number;
  tested_at: string;
  answers: Record<string, number>;
}

// AI Explanation & AI Counselor Chat Types (FR06 & Law 91/2025 Compliance)
export interface AIExplanationResponse {
  major_code: string;
  major_name: string;
  detailed_explanation: string;
  riasec_alignment: string;
  academic_alignment: string;
  diagnostic_readiness: string;
  strengths: string[];
  recommended_focus_areas: string[];
  is_ai_generated: boolean;
}

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export interface AIChatResponse {
  reply: string;
  suggested_followups: string[];
  context_major_code?: string;
  is_fallback: boolean;
}

export interface LLMConnectionTestRequest {
  api_key?: string;
  base_url?: string;
  model?: string;
}

export interface LLMConnectionTestResponse {
  success: boolean;
  status_code: number;
  latency_ms: number;
  model_used: string;
  base_url: string;
  is_configured: boolean;
  message: string;
  preview_reply?: string | null;
  tested_at: string;
}

export interface LLMStatusResponse {
  model: string;
  base_url?: string;
  is_key_configured: boolean;
  masked_key?: string | null;
  embedding_model: string;
}

