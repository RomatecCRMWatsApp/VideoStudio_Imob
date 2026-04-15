import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { saveSession } from '../lib/auth'

export default function RegisterPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.register(form)
      saveSession(token, user)
      nav('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const input = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">VideoStudio</h1>
          <p className="text-gray-400 mt-1">Imob</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 space-y-4 border border-gray-800">
          <h2 className="text-xl font-semibold text-white">Criar conta</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {[
            { k: 'name', label: 'Nome completo', type: 'text', placeholder: 'João Silva' },
            { k: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
            { k: 'password', label: 'Senha', type: 'password', placeholder: '••••••••' },
            { k: 'company', label: 'Empresa (opcional)', type: 'text', placeholder: 'Imobiliária XYZ' },
            { k: 'phone', label: 'Telefone (opcional)', type: 'tel', placeholder: '(11) 99999-9999' },
          ].map(({ k, label, type, placeholder }) => (
            <div key={k}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <input
                type={type} value={(form as any)[k]} onChange={set(k)}
                required={k !== 'company' && k !== 'phone'}
                className={input} placeholder={placeholder}
              />
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-400 hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
