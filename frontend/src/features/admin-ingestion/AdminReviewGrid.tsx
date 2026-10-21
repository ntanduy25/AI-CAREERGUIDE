import { useState } from 'react'

const defaultRows = [
  { id: 1, major_name: 'Computer Science', status: 'PENDING' },
  { id: 2, major_name: 'Business Administration', status: 'APPROVED' },
]

export const AdminReviewGrid = () => {
  const [filter, setFilter] = useState('ALL')
  const rows = filter === 'ALL' ? defaultRows : defaultRows.filter((row) => row.status === filter)

  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Admin Ingestion Review Grid</h2>
        <select className="rounded border px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">ALL</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-sm text-slate-500">Không có dữ liệu.</p>}
        {rows.map((row) => (
          <div className="flex items-center justify-between rounded border p-3" key={row.id}>
            <span>{row.major_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{row.status}</span>
              <button className="rounded border px-2 py-1 text-xs" type="button">
                Approve
              </button>
              <button className="rounded border px-2 py-1 text-xs" type="button">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
