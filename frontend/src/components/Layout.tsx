import { Link, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Trang chủ' },
  { to: '/journey', label: 'Student Journey' },
  { to: '/admin', label: 'Admin Ingestion' },
]

export const Layout = () => (
  <div className="min-h-screen">
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl gap-6 p-4">
        {nav.map((item) => (
          <Link className="text-sm font-semibold text-slate-700 hover:text-blue-600" key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
    <main className="mx-auto max-w-6xl p-4">
      <Outlet />
    </main>
  </div>
)
