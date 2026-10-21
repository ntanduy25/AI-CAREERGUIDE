import { useState } from 'react'

import { fetchRecommendations } from '../services/recommendationService'
import type { RecommendationRequest, RecommendationResponse } from '../types/api'

export const useRecommendations = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (payload: RecommendationRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRecommendations(payload)
      setData(result)
    } catch {
      setError('Không thể tải gợi ý ngành học. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, run }
}
