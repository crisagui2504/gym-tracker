import { useState, useEffect, useRef, useCallback } from 'react'
import { getRutina } from '../services/api'
import { actualizarRecord, esNuevoRecord } from '../services/storage'
import ConfettiPR from '../components/ConfettiPR'
import ModalEjercicio from '../components/ModalEjercicio'

function Cronometro({ segundos, onTerminar }) {
  const [restante, setRestante] = useState(segundos)
  const ref = useRef(null)
  const onTerminarRef = useRef(onTerminar)

  useEffect(() => { onTerminarRef.current = onTerminar }, [onTerminar])

  useEffect(() => {
    const inicio = Date.now()
    ref.current = setInterval(() => {
      const transcurrido = Math.floor((Date.now() - inicio) / 1000)
      const nuevo = segundos - transcurrido
      if (nuevo <= 0) {
        clearInterval(ref.current)
        setRestante(0)
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.8)
        onTerminarRef.current()
      } else {
        setRestante(nuevo)
      }
    }, 500)
    return () => clearInterval(ref.current)
  }, [segundos])

  const porcentaje = (restante / segundos) * 100
  const mins = Math.floor(restante / 60)
  const segs = restante % 60
  const color = restante <= 10 ? '#EF4444' : restante <= 30 ? '#F97316' : '#22C55E'

  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: '#0D1117' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Descansando</span>
        <span className="font-mono font-black text-sm" style={{ color }}>
          {mins}:{segs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-full rounded-full h-1" style={{ background: '#161B22' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${porcentaje}%`, background: color }}
        />
      </div>
    </div>
  )
}

function FilaSerie({ numSerie, unidad, onCompletar, completada, descansoSegundos, datosPrevios }) {
  const [peso, setPeso] = useState('')
  const [reps, setReps] = useState('')
  const [mostraCrono, setMostraCrono] = useState(false)

  const handleCompletar = () => {
    if (!peso || !reps) return
    setMostraCrono(true)
    const pesoFinal = unidad === 'lbs'
      ? parseFloat((parseFloat(peso) * 0.453592).toFixed(2))
      : parseFloat(peso)
    onCompletar({ numero_serie: numSerie, peso_kg: pesoFinal, repeticiones: parseInt(reps) })
  }

  return (
    <div className={`rounded-2xl p-3 mb-2 ${completada ? 'opacity-50' : ''}`} style={{ background: '#161B22' }}>
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${completada ? 'bg-green-900 text-green-400' : 'text-gray-600'}`} style={{ background: completada ? undefined : '#1F2937' }}>
          {completada ? '✓' : numSerie}
        </div>

        <div className="flex gap-2 flex-1">
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#0D1117' }}>
            <div className="text-xs text-gray-600 mb-1">{unidad === 'kg' ? 'Kg' : 'Lbs'}</div>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              placeholder="—"
              disabled={completada}
              className="w-full bg-transparent text-white text-center text-lg font-black outline-none placeholder-gray-700 disabled:opacity-50"
            />
          </div>
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: '#0D1117' }}>
            <div className="text-xs text-gray-600 mb-1">Reps</div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={reps}
              onChange={e => setReps(e.target.value)}
              placeholder="—"
              disabled={completada}
              className="w-full bg-transparent text-white text-center text-lg font-black outline-none placeholder-gray-700 disabled:opacity-50"
            />
          </div>
        </div>

        {!completada && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {datosPrevios && (
              <button
                onClick={() => {
                  setPeso(unidad === 'lbs'
                    ? parseFloat((datosPrevios.peso_kg * 2.20462).toFixed(1))
                    : datosPrevios.peso_kg)
                  setReps(datosPrevios.repeticiones)
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0 active:scale-95 transition-transform"
                style={{ background: '#1e3a5f', color: '#60a5fa', border: '1px solid #2563eb' }}
                title="Repetir serie anterior"
              >
                ↺
              </button>
            )}
            <button
              onClick={handleCompletar}
              disabled={!peso || !reps}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 active:scale-95 transition-transform disabled:opacity-20"
              style={{ background: '#14532D', color: '#22C55E', border: '1px solid #166534' }}
            >
              ✓
            </button>
          </div>
        )}
      </div>

      {mostraCrono && (
        <Cronometro
          segundos={descansoSegundos || 90}
          onTerminar={() => setMostraCrono(false)}
        />
      )}
    </div>
  )
}

function TarjetaEjercicio({ ejercicio, unidad, onSeriesCompletas }) {
  const [series, setSeries] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [ejercicioActual, setEjercicioActual] = useState(ejercicio)

  const maxSeries = parseInt(
    ejercicioActual.series_objetivo?.includes('-')
      ? ejercicioActual.series_objetivo.split('-')[1]
      : ejercicioActual.series_objetivo || '3'
  )

  const numSeriesMin = parseInt(
    ejercicioActual.series_objetivo?.includes('-')
      ? ejercicioActual.series_objetivo.split('-')[0]
      : ejercicioActual.series_objetivo || '3'
  )

  const handleCompletar = useCallback((datosSerie) => {
    setSeries(prev => {
      const nuevas = [...prev, datosSerie]
      if (nuevas.length >= maxSeries) {
        onSeriesCompletas(ejercicioActual.ejercicio_id, ejercicioActual.nombre, nuevas)
      }
      return nuevas
    })
  }, [maxSeries, ejercicioActual.ejercicio_id, ejercicioActual.nombre, onSeriesCompletas])

  const handleAlternar = (alternativa) => {
    setEjercicioActual(alternativa)
    setSeries([])
    setModalAbierto(false)
  }

  const completado = series.length >= numSeriesMin

  return (
    <>
      <div
        className="rounded-2xl p-4 mb-3 transition-opacity"
        style={{ background: '#0D1117', border: `1px solid ${completado ? '#166534' : '#161B22'}`, opacity: completado ? 0.7 : 1 }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-black text-base text-white leading-tight flex-1">{ejercicioActual.nombre}</h3>
          <button
            onClick={() => setModalAbierto(true)}
            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold flex-shrink-0 active:scale-95 transition-transform"
            style={{ background: '#161B22', color: '#58A6FF', border: '1px solid #21262D' }}
          >
            Ver / Alt
          </button>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {[
            ejercicioActual.series_objetivo + ' series',
            ejercicioActual.reps_objetivo + ' reps',
            `${Math.floor(ejercicioActual.descanso_segundos / 60)}:${(ejercicioActual.descanso_segundos % 60).toString().padStart(2, '0')} desc`
          ].map(tag => (
            <span key={tag} className="text-xs rounded-full px-2.5 py-1 font-medium" style={{ background: '#161B22', color: '#6B7280' }}>
              {tag}
            </span>
          ))}
        </div>

        {Array.from({ length: numSeriesMin }).map((_, i) => (
          <FilaSerie
            key={i}
            numSerie={i + 1}
            unidad={unidad}
            completada={i < series.length}
            onCompletar={handleCompletar}
            descansoSegundos={ejercicioActual.descanso_segundos}
            datosPrevios={i > 0 && series[i - 1] ? series[i - 1] : null}
          />
        ))}
      </div>

      {modalAbierto && (
        <ModalEjercicio
          ejercicio={ejercicioActual}
          onCerrar={() => setModalAbierto(false)}
          onAlternar={handleAlternar}
        />
      )}
    </>
  )
}

export default function Entrenamiento({ rutina, onVolver, onFinalizar }) {
  const [unidad, setUnidad] = useState('kg')
  const [seriesGuardadas, setSeriesGuardadas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [ejercicios, setEjercicios] = useState([])
  const [prDetectado, setPrDetectado] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getRutina(rutina.id)
        setEjercicios(data.ejercicios || [])
      } catch {
        setEjercicios([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [rutina.id])

  const handleSeriesCompletas = useCallback((ejercicioId, nombreEjercicio, series) => {
    setSeriesGuardadas(prev => ({ ...prev, [ejercicioId]: series }))
    const mejorSerie = series.reduce((max, s) => s.peso_kg > max.peso_kg ? s : max, series[0])
    if (esNuevoRecord(ejercicioId, mejorSerie.peso_kg)) {
      actualizarRecord(ejercicioId, nombreEjercicio, mejorSerie.peso_kg)
      setPrDetectado({ nombre: nombreEjercicio, peso: mejorSerie.peso_kg })
    }
  }, [])

  const totalEjercicios = ejercicios.length
  const completados = Object.keys(seriesGuardadas).length
  const porcentaje = totalEjercicios > 0 ? (completados / totalEjercicios) * 100 : 0

  return (
    <div className="min-h-screen text-white" style={{ background: '#080C14' }}>
      <div className="max-w-md mx-auto">

        <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ background: '#080C14', borderBottom: '1px solid #0D1117' }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={onVolver} className="text-gray-500 text-sm font-semibold">← Volver</button>
            <button
              onClick={() => setUnidad(u => u === 'kg' ? 'lbs' : 'kg')}
              className="rounded-full px-3 py-1.5 text-xs font-bold active:scale-95 transition-transform"
              style={{ background: '#0D1117', color: '#9CA3AF', border: '1px solid #1F2937' }}
            >
              {unidad === 'kg' ? 'kg → lbs' : 'lbs → kg'}
            </button>
          </div>
          <h2 className="font-black text-xl tracking-tight mb-2">{rutina.nombre} — Día {rutina.dia}</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-full h-1" style={{ background: '#161B22' }}>
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%`, background: '#22C55E' }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: '#6B7280' }}>{completados}/{totalEjercicios}</span>
          </div>
        </div>

        <div className="px-5 py-4">
          {cargando ? (
            <div className="text-center text-gray-600 py-20 text-sm">Cargando rutina...</div>
          ) : ejercicios.length === 0 ? (
            <div className="text-center text-gray-600 py-20">
              <p>Sin ejercicios.</p>
            </div>
          ) : (
            ejercicios.map(ej => (
              <TarjetaEjercicio
                key={ej.ejercicio_id}
                ejercicio={ej}
                unidad={unidad}
                onSeriesCompletas={handleSeriesCompletas}
              />
            ))
          )}

          {completados > 0 && (
            <button
              onClick={() => onFinalizar(seriesGuardadas)}
              className="w-full rounded-2xl py-4 font-black text-base mt-2 mb-8 active:scale-95 transition-transform"
              style={{ background: '#14532D', color: '#22C55E', border: '1px solid #166534' }}
            >
              Finalizar entrenamiento →
            </button>
          )}
        </div>

      </div>

      {prDetectado && (
        <ConfettiPR
          nombre={prDetectado.nombre}
          peso={prDetectado.peso}
          onCerrar={() => setPrDetectado(null)}
        />
      )}
    </div>
  )
}