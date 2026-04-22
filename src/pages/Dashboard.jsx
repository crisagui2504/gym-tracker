import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getEstadisticas } from '../services/api'
import { obtenerHistorialEjercicio, obtenerRecords } from '../services/storage'

function extraerHistorialApi(payload) {
  if (!payload) return []
  const crudo = Array.isArray(payload)
    ? payload
    : payload.historial || payload.progreso || payload.series || payload.data || payload.datos || payload.estadisticas?.historial || []

  if (!Array.isArray(crudo)) return []

  return crudo
    .map((item) => ({
      fecha: item.fecha || item.fecha_entrenamiento || item.created_at || item.dia || null,
      peso: Number(item.peso_kg ?? item.peso ?? item.max_peso ?? item.mejor_peso ?? item.pr),
    }))
    .filter((item) => item.fecha && Number.isFinite(item.peso))
}

function obtenerSemanaISO(fechaRaw) {
  const fecha = new Date(fechaRaw)
  if (Number.isNaN(fecha.getTime())) return null

  const utc = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7)

  return {
    year: utc.getUTCFullYear(),
    week: weekNo,
    key: `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`,
    label: `S${String(weekNo).padStart(2, '0')}/${String(utc.getUTCFullYear()).slice(-2)}`,
  }
}

function agruparSemanal(historial) {
  const mapa = {}
  historial.forEach((punto) => {
    const semana = obtenerSemanaISO(punto.fecha)
    if (!semana) return
    const actual = mapa[semana.key]
    if (!actual || punto.peso > actual.peso) {
      mapa[semana.key] = {
        fecha: semana.label,
        peso: parseFloat(punto.peso.toFixed(2)),
        sortKey: semana.key,
      }
    }
  })

  return Object.values(mapa).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}

export default function Dashboard({ onVolver }) {
  const [records, setRecords] = useState({})
  const [seleccionado, setSeleccionado] = useState(null)
  const [progresoSemanal, setProgresoSemanal] = useState([])
  const [cargandoProgreso, setCargandoProgreso] = useState(false)

  useEffect(() => {
    const r = obtenerRecords()
    setRecords(r)
    const primero = Object.values(r)[0]
    if (primero) setSeleccionado(primero)
  }, [])

  useEffect(() => {
    let activo = true

    async function cargarProgreso() {
      if (!seleccionado?.ejercicio_id) {
        setProgresoSemanal([])
        return
      }

      setCargandoProgreso(true)
      let historial = []

      try {
        const dataApi = await getEstadisticas(seleccionado.ejercicio_id)
        historial = extraerHistorialApi(dataApi)
      } catch {
        historial = []
      }

      if (historial.length === 0) {
        historial = obtenerHistorialEjercicio(seleccionado.ejercicio_id)
      }

      const semanal = agruparSemanal(historial)
      if (activo) {
        if (semanal.length === 0 && seleccionado?.peso) {
          setProgresoSemanal([{ fecha: 'Actual', peso: seleccionado.peso, sortKey: 'z' }])
        } else {
          setProgresoSemanal(semanal)
        }
        setCargandoProgreso(false)
      }
    }

    cargarProgreso()
    return () => {
      activo = false
    }
  }, [seleccionado])

  const lista = Object.values(records)

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6">
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="panel rounded-3xl px-4 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between gap-2 border-b border-white/8 pb-4">
            <button onClick={onVolver} className="btn-secondary rounded-xl px-3 py-2 text-xs">
              Volver
            </button>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Mi progreso</h2>
          </div>

          {lista.length === 0 ? (
            <div className="rounded-2xl border border-sky-300/15 bg-sky-400/5 py-16 text-center">
              <p className="text-base font-bold text-sky-100">Sin datos aun</p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">Completa entrenamientos para ver tus records.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="section-label">Records personales</p>
                <span className="chip">{lista.length} ejercicios</span>
              </div>

              <div className="mb-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                {lista.map((record) => (
                  <button
                    key={record.ejercicio_id}
                    onClick={() => setSeleccionado(record)}
                    className={`hover-lift rounded-2xl border p-3.5 text-left transition duration-200 active:scale-95 sm:p-4 ${
                      seleccionado?.ejercicio_id === record.ejercicio_id
                        ? 'border-emerald-300/50 bg-emerald-400/10'
                        : 'border-sky-300/20 bg-slate-900/45'
                    }`}
                  >
                    <p className="text-sm font-bold">{record.nombre}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-faint)]">{record.fecha}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="mono text-3xl font-black text-emerald-200">{record.peso}</span>
                      <span className="text-xs text-[var(--text-soft)]">kg</span>
                    </div>
                  </button>
                ))}
              </div>

              {seleccionado && (
                <div className="panel-strong rounded-2xl p-4">
                  <p className="section-label mb-1">Evolucion semanal - {seleccionado.nombre}</p>
                  <p className="mb-3 text-xs text-[var(--text-soft)]">
                    {cargandoProgreso ? 'Cargando progreso...' : `${progresoSemanal.length} semanas registradas`}
                  </p>
                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={progresoSemanal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(143, 184, 255, 0.22)" />
                      <XAxis dataKey="fecha" stroke="#8da4c6" fontSize={11} />
                      <YAxis stroke="#8da4c6" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(11, 24, 44, 0.95)',
                          border: '1px solid rgba(143, 184, 255, 0.3)',
                          borderRadius: '12px',
                          color: '#eaf2ff',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#37e2b7"
                        strokeWidth={3}
                        dot={{ fill: '#37e2b7', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-center text-xs text-[var(--text-faint)]">
                    La linea muestra el mejor peso de cada semana.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
