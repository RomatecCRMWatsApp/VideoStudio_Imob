import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { videosApi } from '../lib/api'

interface Scene {
  id: string
  order: number
  type: string
  prompt: string
  engine: string
  status: string
  outputUrl?: string
  durationSecs?: number
}

interface Video {
  id: string
  title: string
  status: string
  progress: number
  engine: string
  style?: string
  outputUrl?: string
  errorMsg?: string
  createdAt: string
  scenes: Scene[]
}

const sceneTypeLabel: Record<string, string> = {
  terrain_delimitation: 'Delimitação do Terreno',
  explosion_clearing: 'Limpeza e Terraplanagem',
  foundation: 'Fundação',
  structure_rising: 'Estrutura',
  roofing_finishing: 'Cobertura e Acabamento',
  house_model_overlay: 'Modelo da Casa',
  final_reveal: 'Reveal Final',
  custom: 'Cena Customizada',
}

const statusColor: Record<string, string> = {
  pending: 'text-gray-400',
  processing: 'text-blue-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
}

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await videosApi.get(id!)
      setVideo(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const iv = setInterval(() => {
      if (video?.status === 'processing' || video?.status === 'queued') load()
    }, 8000)
    return () => clearInterval(iv)
  }, [id, video?.status])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-400">Vídeo não encontrado.</p>
          <Link to="/" className="text-brand-400 hover:underline mt-2 block">Voltar</Link>
        </div>
      </Layout>
    )
  }

  const isProcessing = video.status === 'processing' || video.status === 'queued'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Link to="/" className="text-gray-400 hover:text-white mt-1 transition">
            ← Voltar
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{video.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-medium capitalize ${statusColor[video.status] || 'text-gray-400'}`}>
                {video.status === 'queued' ? 'Na fila' :
                 video.status === 'processing' ? `Processando ${video.progress}%` :
                 video.status === 'completed' ? 'Concluído' :
                 video.status === 'failed' ? 'Falhou' : video.status}
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-sm text-gray-500">
                {new Date(video.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Gerando vídeo com IA...</span>
              <span className="text-sm text-brand-400 font-bold">{video.progress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000"
                style={{ width: `${video.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">Atualizando automaticamente...</p>
          </div>
        )}

        {/* Error */}
        {video.status === 'failed' && video.errorMsg && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-4 mb-6 text-sm">
            Erro: {video.errorMsg}
          </div>
        )}

        {/* Output video */}
        {video.status === 'completed' && video.outputUrl && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Vídeo Final</h2>
            <video
              src={video.outputUrl} controls
              className="w-full rounded-xl max-h-96 bg-black"
            />
            <a
              href={video.outputUrl} download target="_blank" rel="noreferrer"
              className="inline-block mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
            >
              Baixar vídeo
            </a>
          </div>
        )}

        {/* Scenes */}
        {video.scenes && video.scenes.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">
              Cenas ({video.scenes.length})
            </h2>
            <div className="space-y-4">
              {video.scenes.map(scene => (
                <div key={scene.id} className="flex gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-bold text-gray-300">
                    {scene.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-white text-sm">
                        {sceneTypeLabel[scene.type] || scene.type}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{scene.engine}</span>
                        <span className={`text-xs font-medium ${statusColor[scene.status] || 'text-gray-400'}`}>
                          {scene.status === 'completed' ? '✓' :
                           scene.status === 'processing' ? '⟳' :
                           scene.status === 'failed' ? '✗' : '○'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{scene.prompt}</p>
                    {scene.outputUrl && (
                      <video
                        src={scene.outputUrl} controls muted
                        className="mt-3 w-full max-h-48 rounded-lg bg-black"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state while queued */}
        {video.scenes?.length === 0 && isProcessing && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Claude está gerando os prompts das cenas...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
