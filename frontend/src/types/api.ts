export type RecommendationRequest = {
  riasec_vector: Record<string, number>
  preference_vector: Record<string, number>
  block_scores: Record<string, number>
}

export type RecommendationItem = {
  major_id: number
  major_name: string
  overall_score: number
  component_scores: Record<string, number>
  drivers: string[]
  competency_gaps: string[]
}

export type RecommendationResponse = {
  formula_version: string
  recommendations: RecommendationItem[]
}
