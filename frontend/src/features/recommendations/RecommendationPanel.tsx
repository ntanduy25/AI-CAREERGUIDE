import { useRecommendations } from '../../hooks/useRecommendations'

export const RecommendationPanel = () => {
  const { data, loading, error, run } = useRecommendations()

  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gợi ý ngành học</h2>
        <button
          className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() =>
            run({
              riasec_vector: { R: 0.7, I: 0.8, A: 0.3, S: 0.2, E: 0.4, C: 0.5 },
              preference_vector: { E: 0.6, I: 0.4, S: 0.4, N: 0.6, T: 0.6, F: 0.4, J: 0.5, P: 0.5 },
              block_scores: { A01: 0.2, D01: 0.1 },
            })
          }
          type="button"
        >
          Chạy mô phỏng
        </button>
      </div>
      {loading && <p className="mt-3 text-sm">Đang tải...</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {!loading && !error && data && (
        <div className="mt-3 space-y-2">
          {data.recommendations.map((item) => (
            <div className="rounded border p-3" key={item.major_id}>
              <p className="font-medium">{item.major_name}</p>
              <p className="text-sm text-slate-600">Điểm tổng: {item.overall_score.toFixed(4)}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && !data && <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu gợi ý.</p>}
    </section>
  )
}
