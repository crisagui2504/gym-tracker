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
    card: 'from-rose-500/10 to-red-900/5 border-rose-300/25',
    icon: 'bg-rose-500/20 text-rose-200',
    nombre: 'text-rose-200',
    simbolo: 'P',
  },
  pull: {
    card: 'from-sky-500/10 to-blue-900/5 border-sky-300/25',
    icon: 'bg-sky-500/20 text-sky-200',
    nombre: 'text-sky-200',
    simbolo: 'U',
  },
  leg: {
    card: 'from-emerald-500/12 to-teal-900/5 border-emerald-300/25',
    icon: 'bg-emerald-500/20 text-emerald-200',
    nombre: 'text-emerald-200',
    simbolo: 'L',
  },
}

export default function SeleccionRutina({ onSeleccionar, onDashboard }) {
  const [racha, setRacha] = useState({ dias: 0, ultimaFecha: null })

  useEffect(() => {
    getRachaServidor().then((data) => {
      if (data) setRacha(data)
    })
  }, [])

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6">
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="panel rounded-3xl px-4 py-5 sm:px-6">
          <div className="mb-6 flex items-start justify-between gap-3 sm:mb-7">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Gym Tracker</h1>
              <p className="mt-1 text-sm capitalize text-[var(--text-soft)]">{hoy}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/35 bg-amber-200/10 px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <div className="text-xs font-semibold tracking-[0.14em] text-amber-100/90">RACHA</div>
              <div className="mono mt-1 text-2xl font-black leading-none text-amber-200">{racha.dias}</div>
              <div className="mt-1 text-[0.65rem] tracking-[0.12em] text-amber-100/80">DIAS</div>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="section-label">Elige tu rutina</p>
            <span className="chip">9 opciones</span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {RUTINAS.map((rutina) => {
              const est = ESTILOS[rutina.tipo]
              return (
                <button
                  key={rutina.id}
                  onClick={() => onSeleccionar(rutina)}
                  className={`hover-lift min-h-[138px] rounded-2xl border bg-gradient-to-br p-3.5 text-left transition duration-200 active:scale-95 sm:min-h-[150px] sm:p-4 ${est.card}`}
                >
                  <div className={`${est.icon} mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl text-base font-black sm:mb-3 sm:h-10 sm:w-10`}>
                    {est.simbolo}
                  </div>
                  <div className={`text-[1.07rem] font-bold ${est.nombre}`}>{rutina.nombre}</div>
                  <div className="mt-0.5 text-xs text-[var(--text-faint)]">Dia {rutina.dia}</div>
                </button>
              )
            })}
          </div>

          <button
            onClick={onDashboard}
            className="btn-secondary w-full rounded-2xl px-4 py-3.5 text-sm transition duration-200 active:scale-[0.99]"
          >
            Ver mi progreso
          </button>

          <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/5 px-4 py-3 text-xs text-[var(--text-soft)]">
            Tip: completa al menos una rutina diaria para mantener la racha y alimentar tus estadisticas.
          </div>
        </div>
      </div>
    </div>
  )
}
