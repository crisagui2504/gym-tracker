import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { obtenerRecords } from '../services/storage'

export default function Dashboard({ onVolver }) {
  const [records, setRecords] = useState({})
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    const r = obtenerRecords()
    setRecords(r)
    const primero = Object.values(r)[0]
    if (primero) setSeleccionado(primero)
  }, [])

  const lista = Object.values(records)

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6">
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="panel rounded-3xl px-5 py-6 sm:px-6">
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

              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {lista.map((record) => (
                  <button
                    key={record.ejercicio_id}
                    onClick={() => setSeleccionado(record)}
                    className={`rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
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
                  <p className="section-label mb-3">Evolucion - {seleccionado.nombre}</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={[
                        { fecha: 'Inicio', peso: 0 },
                        { fecha: seleccionado.fecha, peso: seleccionado.peso },
                      ]}
                    >
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
                    Esta grafica crecera conforme acumules sesiones.
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
