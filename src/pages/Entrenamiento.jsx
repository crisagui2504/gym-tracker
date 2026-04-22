import { useState, useEffect, useRef, useCallback } from 'react'
import { getRutina } from '../services/api'
import { actualizarRecord, esNuevoRecord } from '../services/storage'
import ConfettiPR from '../components/ConfettiPR'
import ModalEjercicio from '../components/ModalEjercicio'

function Cronometro({ segundos, onTerminar }) {
  const [restante, setRestante] = useState(segundos)
  const ref = useRef(null)
  const onTerminarRef = useRef(onTerminar)

  useEffect(() => {
    onTerminarRef.current = onTerminar
  }, [onTerminar])

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
  const color = restante <= 10 ? '#ff6c7c' : restante <= 30 ? '#ffc76f' : '#37e2b7'

  return (
    <div className="mt-3 rounded-xl border border-cyan-200/15 bg-slate-950/55 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="section-label">Descanso</span>
        <span className="mono text-sm font-black" style={{ color }}>
          {mins}:{segs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-slate-700/60">
        <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%`, background: color }} />
      </div>
    </div>
  )
}

function FilaSerie({ numSerie, unidad, onCompletar, completada, descansoSegundos, datosPrevios }) {
  const [peso, setPeso] = useState('')
  const [reps, setReps] = useState('')
  const [mostrarCrono, setMostrarCrono] = useState(false)

  const handleCompletar = () => {
    if (!peso || !reps) return
    setMostrarCrono(true)
    const pesoFinal = unidad === 'lbs' ? parseFloat((parseFloat(peso) * 0.453592).toFixed(2)) : parseFloat(peso)
    onCompletar({ numero_serie: numSerie, peso_kg: pesoFinal, repeticiones: parseInt(reps, 10) })
  }

  return (
    <div className={`mb-2 rounded-2xl border p-3 ${completada ? 'border-emerald-300/30 bg-emerald-400/8' : 'border-sky-300/15 bg-slate-900/40'}`}>
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${
            completada ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-700/80 text-[var(--text-soft)]'
          }`}
        >
          {completada ? 'OK' : numSerie}
        </div>

        <div className="flex flex-1 gap-2">
          <div className="flex-1 rounded-xl border border-sky-300/15 bg-slate-950/60 p-2.5 text-center">
            <div className="mb-1 text-xs text-[var(--text-faint)]">{unidad === 'kg' ? 'Kg' : 'Lbs'}</div>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="0"
              disabled={completada}
              className="field-input disabled:opacity-50"
            />
          </div>
          <div className="flex-1 rounded-xl border border-sky-300/15 bg-slate-950/60 p-2.5 text-center">
            <div className="mb-1 text-xs text-[var(--text-faint)]">Reps</div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              disabled={completada}
              className="field-input disabled:opacity-50"
            />
          </div>
        </div>

        {!completada && (
          <div className="flex flex-shrink-0 flex-col gap-1">
            {datosPrevios && (
              <button
                onClick={() => {
                  setPeso(unidad === 'lbs' ? parseFloat((datosPrevios.peso_kg * 2.20462).toFixed(1)) : datosPrevios.peso_kg)
                  setReps(datosPrevios.repeticiones)
                }}
                className="h-11 w-11 rounded-full border border-sky-300/40 bg-sky-400/10 text-xs text-sky-100 transition active:scale-95"
                title="Repetir serie anterior"
              >
                REP
              </button>
            )}
            <button
              onClick={handleCompletar}
              disabled={!peso || !reps}
              className="h-11 w-11 rounded-full border border-emerald-300/60 bg-emerald-400/15 text-xs font-bold text-emerald-100 transition active:scale-95 disabled:opacity-25"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {mostrarCrono && <Cronometro segundos={descansoSegundos || 90} onTerminar={() => setMostrarCrono(false)} />}
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
      : ejercicioActual.series_objetivo || '3',
    10,
  )

  const numSeriesMin = parseInt(
    ejercicioActual.series_objetivo?.includes('-')
      ? ejercicioActual.series_objetivo.split('-')[0]
      : ejercicioActual.series_objetivo || '3',
    10,
  )

  const handleCompletar = useCallback(
    (datosSerie) => {
      setSeries((prev) => {
        const nuevas = [...prev, datosSerie]
        if (nuevas.length >= maxSeries) {
          onSeriesCompletas(ejercicioActual.ejercicio_id, ejercicioActual.nombre, nuevas)
        }
        return nuevas
      })
    },
    [maxSeries, ejercicioActual.ejercicio_id, ejercicioActual.nombre, onSeriesCompletas],
  )

  const handleAlternar = (alternativa) => {
    setEjercicioActual(alternativa)
    setSeries([])
    setModalAbierto(false)
  }

  const completado = series.length >= numSeriesMin

  return (
    <>
      <div className="panel-strong mb-3 rounded-2xl p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="flex-1 text-base font-extrabold leading-tight">{ejercicioActual.nombre}</h3>
          <button
            onClick={() => setModalAbierto(true)}
            className="btn-secondary rounded-xl px-2.5 py-1.5 text-xs transition hover:bg-slate-800/85 active:scale-95"
          >
            Ver / Alt
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {[`${ejercicioActual.series_objetivo} series`, `${ejercicioActual.reps_objetivo} reps`, `${Math.floor(ejercicioActual.descanso_segundos / 60)}:${(ejercicioActual.descanso_segundos % 60).toString().padStart(2, '0')} desc`].map(
            (tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ),
          )}
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

        {completado && (
          <div className="mt-3 rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">
            Ejercicio completado.
          </div>
        )}
      </div>

      {modalAbierto && <ModalEjercicio ejercicio={ejercicioActual} onCerrar={() => setModalAbierto(false)} onAlternar={handleAlternar} />}
    </>
  )
}

export default function Entrenamiento({ rutina, onVolver, onFinalizar, onEstadoChange, estadoInicial }) {
  const [unidad, setUnidad] = useState(estadoInicial?.unidad || 'kg')
  const [seriesGuardadas, setSeriesGuardadas] = useState(estadoInicial?.seriesGuardadas || {})
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

  useEffect(() => {
    if (!onEstadoChange) return
    onEstadoChange({ unidad, seriesGuardadas })
  }, [unidad, seriesGuardadas, onEstadoChange])

  const handleSeriesCompletas = useCallback((ejercicioId, nombreEjercicio, series) => {
    setSeriesGuardadas((prev) => ({ ...prev, [ejercicioId]: series }))
    const mejorSerie = series.reduce((max, s) => (s.peso_kg > max.peso_kg ? s : max), series[0])
    if (esNuevoRecord(ejercicioId, mejorSerie.peso_kg)) {
      actualizarRecord(ejercicioId, nombreEjercicio, mejorSerie.peso_kg)
      setPrDetectado({ nombre: nombreEjercicio, peso: mejorSerie.peso_kg })
    }
  }, [])

  const totalEjercicios = ejercicios.length
  const completados = Object.keys(seriesGuardadas).length
  const porcentaje = totalEjercicios > 0 ? (completados / totalEjercicios) * 100 : 0

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6">
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="panel rounded-3xl pb-2">
          <div className="sticky top-[env(safe-area-inset-top)] z-10 rounded-t-3xl border-b border-white/8 bg-[rgba(8,18,34,0.94)] px-4 pb-4 pt-4 backdrop-blur sm:px-5 sm:pt-5">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={onVolver} className="btn-secondary rounded-xl px-3 py-2 text-xs">
                Volver
              </button>
              <button
                onClick={() => setUnidad((u) => (u === 'kg' ? 'lbs' : 'kg'))}
                className="btn-secondary rounded-full px-3 py-1.5 text-xs"
              >
                {unidad === 'kg' ? 'kg a lbs' : 'lbs a kg'}
              </button>
            </div>

            <h2 className="mb-2 text-xl font-extrabold tracking-tight">
              {rutina.nombre} - Dia {rutina.dia}
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-slate-700/65">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-500" style={{ width: `${porcentaje}%` }} />
              </div>
              <span className="mono text-xs font-bold text-[var(--text-soft)]">
                {completados}/{totalEjercicios}
              </span>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5">
            {cargando ? (
              <div className="py-20 text-center text-sm text-[var(--text-soft)]">Cargando rutina...</div>
            ) : ejercicios.length === 0 ? (
              <div className="py-20 text-center text-[var(--text-soft)]">Sin ejercicios.</div>
            ) : (
              ejercicios.map((ej) => (
                <TarjetaEjercicio key={ej.ejercicio_id} ejercicio={ej} unidad={unidad} onSeriesCompletas={handleSeriesCompletas} />
              ))
            )}

            {completados > 0 && (
              <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+0.4rem)] z-20 -mx-1 mt-2 bg-gradient-to-t from-[rgba(8,18,34,0.95)] via-[rgba(8,18,34,0.76)] to-transparent px-1 pb-1.5 pt-3">
                <button
                  onClick={() => onFinalizar(seriesGuardadas)}
                  className="btn-primary w-full rounded-2xl px-4 py-4 text-base transition active:scale-[0.99]"
                >
                  Finalizar entrenamiento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {prDetectado && <ConfettiPR nombre={prDetectado.nombre} peso={prDetectado.peso} onCerrar={() => setPrDetectado(null)} />}
    </div>
  )
}
