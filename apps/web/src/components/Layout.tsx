import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, clearSession } from '../lib/auth'

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const user = getUser()

  function logout() {
    clearSession()
    nav('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-lg">
          VideoStudio <span className="text-brand-400">Imob</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition ${loc.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Dashboard
          </Link>
          <Link
            to="/new"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Novo Vídeo
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.credits ?? 0} créditos</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
