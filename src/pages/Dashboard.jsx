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
    <div className="min-h-screen text-white" style={{ background: '#080C14' }}>
      <div className="max-w-md mx-auto px-5">

        <div className="flex items-center gap-3 pt-5 pb-4" style={{ borderBottom: '1px solid #0D1117' }}>
          <button onClick={onVolver} className="text-gray-500 text-sm font-semibold">← Volver</button>
          <h2 className="font-black text-xl tracking-tight">Mi progreso</h2>
        </div>

        {lista.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-500 font-semibold">Sin datos aún</p>
            <p className="text-gray-700 text-sm mt-1">Completa entrenamientos para ver tu progreso</p>
          </div>
        ) : (
          <>
            <div className="mt-5 mb-4">
              <p className="text-gray-600 text-xs font-semibold tracking-widest uppercase mb-3">
                Récords personales
              </p>
              <div className="flex flex-col gap-2">
                {lista.map(record => (
                  <button
                    key={record.ejercicio_id}
                    onClick={() => setSeleccionado(record)}
                    className="rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-all"
                    style={{
                      background: seleccionado?.ejercicio_id === record.ejercicio_id ? '#1C2A1C' : '#0D1117',
                      border: `1px solid ${seleccionado?.ejercicio_id === record.ejercicio_id ? '#166534' : '#161B22'}`
                    }}
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">{record.nombre}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{record.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-green-400">{record.peso}</p>
                      <p className="text-xs text-gray-600">kg</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {seleccionado && (
              <div className="rounded-2xl p-4 mb-8" style={{ background: '#0D1117', border: '1px solid #161B22' }}>
                <p className="text-gray-600 text-xs font-semibold tracking-widest uppercase mb-3">
                  Evolución — {seleccionado.nombre}
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={[
                    { fecha: 'Inicio', peso: 0 },
                    { fecha: seleccionado.fecha, peso: seleccionado.peso }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161B22" />
                    <XAxis dataKey="fecha" stroke="#374151" fontSize={11} />
                    <YAxis stroke="#374151" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#0D1117', border: '1px solid #161B22', borderRadius: '12px', color: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={{ fill: '#22C55E', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-gray-700 text-xs text-center mt-2">
                  La gráfica crecerá con más entrenamientos
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}