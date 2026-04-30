import { useState, useEffect, useRef, useCallback } from 'react'
import { getRutina } from '../services/api'
import { actualizarRecord, esNuevoRecord, obtenerRecords, guardarRegistroHistorial, calcularSugerenciaProgresion } from '../services/storage'
import ConfettiPR from '../components/ConfettiPR'
import ModalEjercicio from '../components/ModalEjercicio'
import CalentamientoPrevio from '../components/CalentamientoPrevio'

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

  return (
    <div className="mt-3 rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="section-label">Descanso</span>
        <span className="mono text-sm font-semibold text-[var(--primary)]">
          {mins}:{segs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#dde3e6]">
        <div className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-500" style={{ width: `${porcentaje}%` }} />
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
    <div className={`mb-2 rounded-xl border p-3 ${completada ? 'border-[#bdd9c1] bg-[#ebf6ea]' : 'border-[var(--surface-container-highest)] bg-[var(--surface)]'}`}>
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${completada ? 'bg-[#d7ebda] text-[#2e5e35]' : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'}`}>
          {completada ? 'OK' : numSerie}
        </div>

        <div className="flex flex-1 gap-2">
          <div className="flex-1 rounded-xl border border-[var(--surface-container-highest)] bg-[#fff] p-2 text-center">
            <div className="mb-1 text-xs text-[var(--on-surface-variant)]">{unidad === 'kg' ? 'Kg' : 'Lbs'}</div>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="0"
              disabled={completada}
              className="field-input disabled:opacity-40"
            />
          </div>
          <div className="flex-1 rounded-xl border border-[var(--surface-container-highest)] bg-[#fff] p-2 text-center">
            <div className="mb-1 text-xs text-[var(--on-surface-variant)]">Reps</div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              disabled={completada}
              className="field-input disabled:opacity-40"
            />
          </div>
        </div>

        {!completada && (
          <div className="flex flex-col gap-1">
            {datosPrevios && (
              <button
                onClick={() => {
                  setPeso(unidad === 'lbs' ? parseFloat((datosPrevios.peso_kg * 2.20462).toFixed(1)) : datosPrevios.peso_kg)
                  setReps(datosPrevios.repeticiones)
                }}
                className="h-11 w-11 rounded-full border border-[#c4d9e0] bg-[#e8f2f6] text-xs font-semibold text-[#344a52] active:scale-95"
                title="Repetir serie anterior"
              >
                REP
              </button>
            )}
            <button
              onClick={handleCompletar}
              disabled={!peso || !reps}
              className="h-11 w-11 rounded-full border border-[#8fb0bc] bg-[#cee7f0] text-xs font-semibold text-[#2f454d] active:scale-95 disabled:opacity-35"
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

function redondearPeso(valor, paso = 2.5) {
  return Math.max(paso, Math.round(valor / paso) * paso)
}

function generarCalentamiento(prKg) {
  if (!prKg || prKg < 5) return []
  if (prKg < 30) return [{ porcentaje: 0.5, reps: 10 }, { porcentaje: 0.7, reps: 6 }]
  return [{ porcentaje: 0.5, reps: 10 }, { porcentaje: 0.75, reps: 5 }, { porcentaje: 0.875, reps: 3 }]
}

function TarjetaEjercicio({ ejercicio, unidad, onSeriesCompletas, recordsMap, ejerciciosEnRutina, onSwap }) {
  const [series, setSeries] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [ejercicioActual, setEjercicioActual] = useState(ejercicio)

  const maxSeries = parseInt(
    ejercicioActual.series_objetivo?.includes('-') ? ejercicioActual.series_objetivo.split('-')[1] : ejercicioActual.series_objetivo || '3',
    10,
  )
  const numSeriesMin = parseInt(
    ejercicioActual.series_objetivo?.includes('-') ? ejercicioActual.series_objetivo.split('-')[0] : ejercicioActual.series_objetivo || '3',
    10,
  )

  const handleCompletar = useCallback(
    (datosSerie) => {
      setSeries((prev) => {
        const nuevas = [...prev, datosSerie]
        if (nuevas.length >= numSeriesMin) {
          onSeriesCompletas(ejercicioActual.ejercicio_id, ejercicioActual.nombre, nuevas)
        }
        return nuevas
      })
    },
    [numSeriesMin, ejercicioActual.ejercicio_id, ejercicioActual.nombre, onSeriesCompletas],
  )

  const completado = series.length >= numSeriesMin
  const prKg = recordsMap?.[ejercicioActual.ejercicio_id]?.peso || null
  const sugerenciaProgresion = calcularSugerenciaProgresion(
    ejercicioActual.ejercicio_id,
    ejercicioActual.reps_objetivo
  )
  const sugerencias = generarCalentamiento(prKg).map((paso) => {
    const kg = redondearPeso(prKg * paso.porcentaje)
    return unidad === 'lbs'
      ? { peso: parseFloat((kg * 2.20462).toFixed(1)), unidad: 'lbs', reps: paso.reps }
      : { peso: parseFloat(kg.toFixed(1)), unidad: 'kg', reps: paso.reps }
  })

  return (
    <>
      <div className="panel-strong mb-3 rounded-xl p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold">{ejercicioActual.nombre}</h3>
          <button onClick={() => setModalAbierto(true)} className="btn-secondary rounded-lg px-3 py-1.5 text-xs">Ver / Alt</button>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {[`${ejercicioActual.series_objetivo} series`, `${ejercicioActual.reps_objetivo} reps`, `${Math.floor(ejercicioActual.descanso_segundos / 60)}:${(ejercicioActual.descanso_segundos % 60).toString().padStart(2, '0')} desc`].map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>

        {sugerencias.length > 0 && series.length === 0 && (
          <div className="mb-3 rounded-xl border border-[#e6cfab] bg-[#fff4e5] p-3">
            <p className="section-label mb-2 text-[#7a5a33]">Calentamiento sugerido</p>
            <div className="flex flex-wrap gap-2">
              {sugerencias.map((paso, i) => (
                <span key={`${paso.peso}-${i}`} className="chip border-[#e8ceb1] bg-[#ffead2] text-[#6f5130]">
                  {paso.peso} {paso.unidad} x {paso.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        {sugerenciaProgresion && series.length === 0 && (
          <div className={`mb-3 rounded-xl border p-3 ${
            sugerenciaProgresion.tipo === 'subir'
              ? 'border-[#b8d9c2] bg-[#eaf6ee]'
              : sugerenciaProgresion.tipo === 'mantener'
              ? 'border-[#e6cfab] bg-[#fff4e5]'
              : 'border-[var(--surface-container-highest)] bg-[var(--surface)]'
          }`}>
            <p className="section-label mb-1">
              {sugerenciaProgresion.tipo === 'subir' ? '↑ Sube el peso hoy' :
               sugerenciaProgresion.tipo === 'mantener' ? '→ Mantén el peso' : '= Igual que antes'}
            </p>
            <p className="text-sm font-semibold">
              {sugerenciaProgresion.peso} kg
              {sugerenciaProgresion.repsObjetivo ? ` × ${sugerenciaProgresion.repsObjetivo} reps` : ''}
            </p>
            <p className="mt-0.5 text-xs text-[var(--on-surface-variant)]">{sugerenciaProgresion.mensaje}</p>
          </div>
        )}

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

        {completado && <div className="mt-2 rounded-lg bg-[#e7f4e8] px-3 py-2 text-xs font-semibold text-[#2c5c32]">Ejercicio completado</div>}
      </div>

      {modalAbierto && (
        <ModalEjercicio
          ejercicio={ejercicioActual}
          onCerrar={() => setModalAbierto(false)}
          onAlternar={(alternativa, opciones) => {
            if (opciones?.swap && opciones?.posicionDuplicado !== -1) {
              // Swap: la alternativa toma este lugar, este ejercicio va al lugar del duplicado
              onSwap(ejercicioActual, alternativa, opciones.posicionDuplicado)
            } else {
              setEjercicioActual(alternativa)
              setSeries([])
            }
            setModalAbierto(false)
          }}
          ejerciciosEnRutina={ejerciciosEnRutina}
        />
      )}
    </>
  )
}

export default function Entrenamiento({ rutina, onVolver, onFinalizar, onEstadoChange, estadoInicial }) {
  const [unidad, setUnidad] = useState(estadoInicial?.unidad || 'kg')
  const [seriesGuardadas, setSeriesGuardadas] = useState(estadoInicial?.seriesGuardadas || {})
  const [cargando, setCargando] = useState(true)
  const [ejercicios, setEjercicios] = useState([])
  const [prDetectado, setPrDetectado] = useState(null)
  const [recordsMap, setRecordsMap] = useState({})

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
    setRecordsMap(obtenerRecords())
  }, [])

  useEffect(() => {
    if (!onEstadoChange) return
    onEstadoChange({ unidad, seriesGuardadas })
  }, [unidad, seriesGuardadas, onEstadoChange])

  const handleSeriesCompletas = useCallback((ejercicioId, nombreEjercicio, series) => {
    setSeriesGuardadas((prev) => ({ ...prev, [ejercicioId]: series }))
    const mejorSerie = series.reduce((max, s) => (s.peso_kg > max.peso_kg ? s : max), series[0])
    guardarRegistroHistorial({ ejercicioId, nombreEjercicio, pesoKg: mejorSerie.peso_kg, repeticiones: mejorSerie.repeticiones })
    if (esNuevoRecord(ejercicioId, mejorSerie.peso_kg)) {
      actualizarRecord(ejercicioId, nombreEjercicio, mejorSerie.peso_kg)
      setRecordsMap(obtenerRecords())
      setPrDetectado({ nombre: nombreEjercicio, peso: mejorSerie.peso_kg })
    }
  }, [])

  const handleSwap = useCallback((ejercicioActual, alternativa, posicionDuplicado) => {
    setEjercicios(prev => {
      const nuevos = [...prev]
      const posActual = nuevos.findIndex(e => e.ejercicio_id === ejercicioActual.ejercicio_id)
      if (posActual === -1) return prev
      // Intercambiar
      const temp = { ...nuevos[posActual] }
      nuevos[posActual] = { ...nuevos[posicionDuplicado] }
      nuevos[posicionDuplicado] = temp
      return nuevos
    })
  }, [])

  const completados = Object.keys(seriesGuardadas).length
  const total = ejercicios.length
  const porcentaje = total > 0 ? (completados / total) * 100 : 0

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[120px] pt-[88px]">
      <section className="panel rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onVolver} className="btn-secondary rounded-xl px-3 py-2 text-sm">Volver</button>
          <button onClick={() => setUnidad((u) => (u === 'kg' ? 'lbs' : 'kg'))} className="btn-secondary rounded-full px-3 py-2 text-xs">
            {unidad === 'kg' ? 'kg a lbs' : 'lbs a kg'}
          </button>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">{rutina.nombre} - Dia {rutina.dia}</h2>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#d8dddd]">
            <div className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${porcentaje}%` }} />
          </div>
          <span className="text-xs text-[var(--on-surface-variant)]">{completados}/{total}</span>
        </div>

        {cargando ? (
          <div className="py-16 text-center text-sm text-[var(--on-surface-variant)]">Cargando rutina...</div>
        ) : ejercicios.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--on-surface-variant)]">Sin ejercicios.</div>
        ) : (
          <>
            <CalentamientoPrevio tipo={rutina.tipo} />
            {ejercicios.map((ej) => (
              <TarjetaEjercicio
                key={ej.ejercicio_id}
                ejercicio={ej}
                unidad={unidad}
                onSeriesCompletas={handleSeriesCompletas}
                recordsMap={recordsMap}
                ejerciciosEnRutina={ejercicios}
                onSwap={handleSwap}
              />
            ))}
          </>
        )}

        {completados > 0 && (
          <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
            <button onClick={() => onFinalizar(seriesGuardadas)} className="btn-primary w-full rounded-xl px-5 py-4 text-sm">
              Finalizar entrenamiento
            </button>
          </div>
        )}
      </section>

      {prDetectado && <ConfettiPR nombre={prDetectado.nombre} peso={prDetectado.peso} onCerrar={() => setPrDetectado(null)} />}
    </main>
  )
}
