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
  return { key: `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`, label: `S${String(weekNo).padStart(2, '0')}` }
}

function agruparSemanal(historial) {
  const mapa = {}
  historial.forEach((punto) => {
    const semana = obtenerSemanaISO(punto.fecha)
    if (!semana) return
    const actual = mapa[semana.key]
    if (!actual || punto.peso > actual.peso) {
      mapa[semana.key] = { fecha: semana.label, peso: parseFloat(punto.peso.toFixed(2)), sortKey: semana.key }
    }
  })
  return Object.values(mapa).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
}

export default function Dashboard({ onVolver }) {
  const [records, setRecords] = useState({})
  const [seleccionado, setSeleccionado] = useState(null)
  const [progresoSemanal, setProgresoSemanal] = useState([])

  useEffect(() => {
    const r = obtenerRecords()
    setRecords(r)
    const primero = Object.values(r)[0]
    if (primero) setSeleccionado(primero)
  }, [])

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!seleccionado?.ejercicio_id) return
      let historial = []
      try {
        const api = await getEstadisticas(seleccionado.ejercicio_id)
        historial = extraerHistorialApi(api)
      } catch {
        historial = []
      }
      if (!historial.length) historial = obtenerHistorialEjercicio(seleccionado.ejercicio_id)
      const semanal = agruparSemanal(historial)
      if (mounted) {
        if (semanal.length === 0 && seleccionado?.peso) setProgresoSemanal([{ fecha: 'Actual', peso: seleccionado.peso, sortKey: 'z' }])
        else setProgresoSemanal(semanal)
      }
    }
    run()
    return () => { mounted = false }
  }, [seleccionado])

  const lista = Object.values(records)

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-[120px] pt-[88px]">
      <section className="panel rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onVolver} className="btn-secondary rounded-xl px-3 py-2 text-sm">Volver</button>
          <h2 className="text-2xl font-semibold">Mi progreso</h2>
        </div>

        {!lista.length ? (
          <div className="rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] p-8 text-center">
            <p className="text-base font-semibold">Sin datos aun</p>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">Completa entrenamientos para ver tu evolucion.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="section-label">Records personales</p>
              <span className="chip">{lista.length} ejercicios</span>
            </div>

            <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
              {lista.map((record) => (
                <button
                  key={record.ejercicio_id}
                  onClick={() => setSeleccionado(record)}
                  className={`min-w-[180px] rounded-xl border p-4 text-left ${
                    seleccionado?.ejercicio_id === record.ejercicio_id
                      ? 'border-[#b8d0da] bg-[var(--primary-fixed)]'
                      : 'border-[var(--surface-container-highest)] bg-[var(--surface)]'
                  }`}
                >
                  <p className="text-sm font-semibold">{record.nombre}</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--primary)]">{record.peso}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">kg</p>
                </button>
              ))}
            </div>

            <div className="panel-strong rounded-xl p-4">
              <p className="section-label mb-2">Evolucion semanal</p>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={progresoSemanal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d7d9" />
                  <XAxis dataKey="fecha" stroke="#70787d" fontSize={11} />
                  <YAxis stroke="#70787d" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e3e2e2',
                      borderRadius: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#4b626a" strokeWidth={3} dot={{ fill: '#4b626a', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-center text-xs text-[var(--on-surface-variant)]">
                Mejor peso de cada semana
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
