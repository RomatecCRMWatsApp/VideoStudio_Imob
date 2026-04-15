import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { videosApi, uploadImage } from '../lib/api'

const ENGINES = [
  { value: 'auto', label: 'Auto (recomendado)', desc: 'Escolhe o melhor motor por cena' },
  { value: 'runway', label: 'Runway Gen-4', desc: 'Ótimo para movimento e estrutura' },
  { value: 'kling', label: 'Kling 2.1 Pro', desc: 'Excelente para cenas detalhadas' },
  { value: 'veo3', label: 'Veo 3.1', desc: 'Reveal final cinematográfico' },
]

const STYLES = ['Moderno', 'Clássico', 'Contemporâneo', 'Minimalista', 'Rústico', 'Industrial']

export default function NewVideoPage() {
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    title: '',
    address: '',
    areaM2: '',
    houseModel: '',
    houseStyle: 'Moderno',
    engine: 'auto',
    customInstructions: '',
  })

  function setF(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let sourceImageUrl: string | undefined
      if (imageFile) sourceImageUrl = await uploadImage(imageFile)

      const video = await videosApi.create({
        title: form.title,
        engine: form.engine,
        style: form.houseStyle,
        sourceImageUrl,
        address: form.address,
        areaM2: form.areaM2 ? parseFloat(form.areaM2) : undefined,
        houseModel: form.houseModel,
        houseStyle: form.houseStyle,
        customInstructions: form.customInstructions,
      })

      nav(`/videos/${video.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar vídeo')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500'

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Novo Vídeo</h1>
          <p className="text-gray-400 text-sm mt-1">
            Preencha os dados do imóvel e a IA irá gerar todas as cenas automaticamente
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition
                ${step >= s ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {s}
              </div>
              {s < 2 && <div className={`h-0.5 w-12 ${step > s ? 'bg-brand-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400">
            {step === 1 ? 'Dados do projeto' : 'Configurações de vídeo'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 space-y-5">

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título do vídeo *</label>
                  <input required value={form.title} onChange={setF('title')} className={inputCls}
                    placeholder="Ex: Casa 3 quartos - Bairro Jardins" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Endereço / Localização</label>
                  <input value={form.address} onChange={setF('address')} className={inputCls}
                    placeholder="Ex: Rua das Flores, 123 - São Paulo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Área do terreno (m²)</label>
                    <input type="number" value={form.areaM2} onChange={setF('areaM2')} className={inputCls}
                      placeholder="Ex: 250" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Modelo da casa</label>
                    <input value={form.houseModel} onChange={setF('houseModel')} className={inputCls}
                      placeholder="Ex: Sobrado 3q" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estilo arquitetônico</label>
                  <select value={form.houseStyle} onChange={setF('houseStyle')}
                    className={inputCls}>
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Imagem de referência (opcional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 transition overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Clique para enviar</p>
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG até 10MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  </label>
                </div>
                <button
                  type="button" onClick={() => { if (form.title) setStep(2) }}
                  disabled={!form.title}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Próximo
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Motor de IA</label>
                  <div className="space-y-2">
                    {ENGINES.map(eng => (
                      <label key={eng.value} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition
                        ${form.engine === eng.value ? 'border-brand-500 bg-brand-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                        <input type="radio" name="engine" value={eng.value} checked={form.engine === eng.value}
                          onChange={setF('engine')} className="mt-0.5 accent-brand-500" />
                        <div>
                          <p className="font-medium text-white text-sm">{eng.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{eng.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Instruções adicionais (opcional)</label>
                  <textarea value={form.customInstructions} onChange={setF('customInstructions')}
                    rows={3} className={inputCls + ' resize-none'}
                    placeholder="Ex: Incluir drone shot do terreno, usar cores quentes..." />
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 text-sm">
                  <p className="text-gray-300 font-medium mb-2">O que será gerado:</p>
                  <ul className="space-y-1 text-gray-400">
                    {['Delimitação do terreno','Limpeza e terraplanagem','Fundação','Estrutura sendo erguida','Cobertura e acabamento','Modelo 3D overlay','Reveal final cinematográfico']
                      .map((s, i) => <li key={i} className="flex items-center gap-2"><span className="text-brand-400">✓</span>{s}</li>)}
                  </ul>
                  <p className="text-gray-500 text-xs mt-3">Custo: 1 crédito</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition">
                    Voltar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
                    {loading ? 'Criando...' : 'Gerar Vídeo'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </Layout>
  )
}
