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

const LANE = {
  push: {
    title: 'Push',
    card: 'bg-[var(--lane-push-bg)] text-[var(--lane-push-text)] shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
    badge: 'bg-[var(--lane-push-badge-bg)] text-[var(--lane-push-badge-text)]',
  },
  pull: {
    title: 'Pull',
    card: 'bg-[var(--lane-pull-bg)] text-[var(--lane-pull-text)] shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
    badge: 'bg-[var(--lane-pull-badge-bg)] text-[var(--lane-pull-badge-text)]',
  },
  leg: {
    title: 'Legs',
    card: 'bg-[var(--lane-leg-bg)] text-[var(--lane-leg-text)] shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
    badge: 'bg-[var(--lane-leg-badge-bg)] text-[var(--lane-leg-badge-text)]',
  },
}

export default function SeleccionRutina({ onSeleccionar, onDashboard, sesionPausada, onReanudar, onDescartarSesion }) {
  const [racha, setRacha] = useState({ dias: 0, ultimaFecha: null })
  const [temaOscuro, setTemaOscuro] = useState(() => localStorage.getItem('gym_theme') === 'dark')

  useEffect(() => {
    getRachaServidor().then((data) => {
      if (data) setRacha(data)
    })
  }, [])

  useEffect(() => {
    document.body.classList.toggle('theme-dark', temaOscuro)
    localStorage.setItem('gym_theme', temaOscuro ? 'dark' : 'light')
  }, [temaOscuro])

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const porTipo = {
    push: RUTINAS.filter((r) => r.tipo === 'push'),
    pull: RUTINAS.filter((r) => r.tipo === 'pull'),
    leg: RUTINAS.filter((r) => r.tipo === 'leg'),
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 pb-[120px] pt-[88px] lg:px-8 lg:pt-[96px]">
      <button
        type="button"
        onClick={() => setTemaOscuro((prev) => !prev)}
        className="theme-toggle fixed left-4 top-4 z-40 flex items-center gap-2"
        aria-label="Cambiar tema"
      >
        <span>{temaOscuro ? '☀' : '🌙'}</span>
        <span className="hidden sm:inline">{temaOscuro ? 'Light' : 'Dark'}</span>
      </button>

      <section className="flex flex-col gap-3">
        <h2 className="font-['Lexend'] text-sm capitalize text-[var(--on-surface-variant)]">{hoy}</h2>
        <div className="panel rounded-xl p-5 lg:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-[30px] font-bold leading-tight tracking-tight text-[var(--on-surface)]">Gym Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-fixed)] text-lg">🔥</div>
            <div>
              <p className="text-2xl font-bold text-[var(--on-surface)]">{racha.dias} Dias</p>
              <p className="text-sm text-[var(--on-surface-variant)]">Racha actual</p>
            </div>
          </div>
        </div>
      </section>

      {sesionPausada && (
        <section className="rounded-xl border border-[#c8dac7] bg-[#ebf6ea] p-4">
          <p className="font-['Lexend'] text-sm text-[#345b39]">Sesion pausada</p>
          <p className="mt-1 text-base font-semibold text-[#1f3222]">
            {sesionPausada.rutina.nombre} - Dia {sesionPausada.rutina.dia}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={onReanudar} className="btn-primary flex-1 rounded-xl px-4 py-2.5 text-sm">Reanudar</button>
            <button onClick={onDescartarSesion} className="btn-secondary rounded-xl px-4 py-2.5 text-sm">Descartar</button>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {['push', 'pull', 'leg'].map((tipo) => (
          <section key={tipo} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-[var(--on-surface)]">{LANE[tipo].title}</h3>
              <span className="chip">{porTipo[tipo].length} dias</span>
            </div>
            <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible">
              {porTipo[tipo].map((rutina) => (
                <button
                  key={rutina.id}
                  onClick={() => onSeleccionar(rutina)}
                  className={`hover-lift min-h-[160px] min-w-[220px] snap-start rounded-xl p-5 text-left transition duration-200 active:scale-[0.98] lg:min-w-0 ${LANE[tipo].card}`}
                >
                  <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${LANE[tipo].badge}`}>Dia {rutina.dia}</span>
                  <h4 className="text-2xl font-semibold">{rutina.nombre}</h4>
                  <p className="mt-2 text-sm opacity-80">Iniciar entrenamiento</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-2">
        <button onClick={onDashboard} className="btn-primary w-full rounded-xl px-5 py-4 text-sm">
          Ver mi progreso
        </button>
      </section>
    </main>
  )
}
