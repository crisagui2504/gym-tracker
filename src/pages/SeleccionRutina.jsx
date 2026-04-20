import { useState, useEffect } from 'react'
import { getRachaServidor } from '../services/api'

const RUTINAS = [
  { id: 1, nombre: 'Push', dia: 1, tipo: 'push' },
  { id: 2, nombre: 'Pull', dia: 1, tipo: 'pull' },
  { id: 3, nombre: 'Pierna', dia: 1, tipo: 'leg' },
  { id: 4, nombre: 'Push', dia: 2, tipo: 'push' },
  { id: 5, nombre: 'Pull', dia: 2, tipo: 'pull' },
  { id: 6, nombre: 'Pierna', dia: 2, tipo: 'leg' },
  { id: 7, nombre: 'Push', dia: 3, tipo: 'push' },
  { id: 8, nombre: 'Pull', dia: 3, tipo: 'pull' },
  { id: 9, nombre: 'Pierna', dia: 3, tipo: 'leg' },
]

const ESTILOS = {
  push: {
    card: 'bg-red-950 border border-red-900/40',
    icon: 'bg-red-900/50',
    nombre: 'text-red-400',
    simbolo: '↑',
  },
  pull: {
    card: 'bg-blue-950 border border-blue-900/40',
    icon: 'bg-blue-900/50',
    nombre: 'text-blue-400',
    simbolo: '↓',
  },
  leg: {
    card: 'bg-green-950 border border-green-900/40',
    icon: 'bg-green-900/50',
    nombre: 'text-green-400',
    simbolo: '⊥',
  },
}

export default function SeleccionRutina({ onSeleccionar, onDashboard }) {
  const [racha, setRacha] = useState({ dias: 0, ultimaFecha: null })

  useEffect(() => {
    getRachaServidor().then(data => {
      if (data) setRacha(data)
    })
  }, [])

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="min-h-screen text-white p-5" style={{ background: '#080C14' }}>
      <div className="max-w-md mx-auto">

        <div className="flex items-start justify-between mb-8 pt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Gym Tracker</h1>
            <p className="text-gray-500 text-sm mt-1 capitalize">{hoy}</p>
          </div>
          <div className="rounded-2xl px-4 py-3 text-center border border-gray-800" style={{ background: '#0D1117' }}>
            <div className="text-xl">🔥</div>
            <div className="text-xl font-black text-orange-400 leading-none">{racha.dias}</div>
            <div className="text-gray-600 text-xs tracking-widest mt-0.5">DÍAS</div>
          </div>
        </div>

        <p className="text-gray-600 text-xs font-semibold tracking-widest uppercase mb-3">
          Elige tu rutina
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {RUTINAS.map((rutina) => {
            const est = ESTILOS[rutina.tipo]
            return (
              <button
                key={rutina.id}
                onClick={() => onSeleccionar(rutina)}
                className={`${est.card} rounded-2xl p-4 flex flex-col gap-2 text-left active:scale-95 transition-transform`}
              >
                <div className={`${est.icon} w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black`}>
                  <span className={est.nombre}>{est.simbolo}</span>
                </div>
                <div>
                  <div className={`text-sm font-bold ${est.nombre}`}>{rutina.nombre}</div>
                  <div className="text-gray-600 text-xs">Día {rutina.dia}</div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={onDashboard}
          className="w-full rounded-2xl py-3.5 text-gray-500 text-sm font-semibold border border-gray-800 active:scale-95 transition-transform"
          style={{ background: '#0D1117' }}
        >
          📊 Ver mi progreso
        </button>

      </div>
    </div>
  )
}