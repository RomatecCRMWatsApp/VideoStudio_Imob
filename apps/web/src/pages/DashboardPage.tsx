import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { videosApi } from '../lib/api'

interface Video {
  id: string
  title: string
  status: string
  progress: number
  engine: string
  outputUrl?: string
  createdAt: string
}

const statusColor: Record<string, string> = {
  pending: 'bg-gray-700 text-gray-300',
  queued: 'bg-yellow-900 text-yellow-300',
  processing: 'bg-blue-900 text-blue-300',
  completed: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  queued: 'Na fila',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
}

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await videosApi.list()
      setVideos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 10000)
    return () => clearInterval(iv)
  }, [])

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Seus Vídeos</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie e acompanhe a geração dos seus vídeos imobiliários</p>
        </div>
        <Link
          to="/new"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition"
        >
          + Novo Vídeo
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum vídeo ainda</h3>
          <p className="text-gray-400 mb-6">Crie seu primeiro vídeo de construção imobiliária com IA</p>
          <Link
            to="/new"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Criar primeiro vídeo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(v => (
            <Link
              key={v.id}
              to={`/videos/${v.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition group"
            >
              {v.outputUrl ? (
                <div className="w-full h-40 bg-gray-800 rounded-lg mb-4 overflow-hidden">
                  <video src={v.outputUrl} className="w-full h-full object-cover" muted />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  {v.status === 'processing' ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-400">{v.progress}%</p>
                    </div>
                  ) : (
                    <span className="text-4xl">🎬</span>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-brand-300 transition">
                    {v.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(v.createdAt).toLocaleDateString('pt-BR')} · {v.engine}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusColor[v.status] || 'bg-gray-700 text-gray-300'}`}>
                  {statusLabel[v.status] || v.status}
                </span>
              </div>

              {v.status === 'processing' && (
                <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${v.progress}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
