import { apiClient } from './apiClient'
import type { RecommendationRequest, RecommendationResponse } from '../types/api'

export const fetchRecommendations = async (payload: RecommendationRequest): Promise<RecommendationResponse> => {
  const response = await apiClient.post<RecommendationResponse>('/recommendations/rank', payload)
  return response.data
}
