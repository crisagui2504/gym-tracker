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

export default function SeleccionRutina({
  onSeleccionar,
  onDashboard,
  sesionPausada,
  onReanudar,
  onDescartarSesion,
  estadoCicloRutinas,
}) {
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
  const completadasHoy = estadoCicloRutinas?.completadasHoy || []
  const siguienteId = estadoCicloRutinas?.nextRutinaId
  const siguienteRutina = RUTINAS.find((r) => r.id === siguienteId)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 pb-[92px] pt-[74px] sm:gap-5 sm:px-5 sm:pb-[110px] sm:pt-[86px] lg:gap-6 lg:px-8 lg:pt-[96px]">
      <button
        type="button"
        onClick={() => setTemaOscuro((prev) => !prev)}
        className="theme-toggle fixed left-4 top-4 z-40 flex items-center gap-2"
        aria-label="Cambiar tema"
      >
        <span>{temaOscuro ? 'Light' : 'Dark'}</span>
      </button>

      <section className="flex flex-col gap-2.5 sm:gap-3">
        <h2 className="font-['Lexend'] text-sm capitalize text-[var(--on-surface-variant)]">{hoy}</h2>
        <div className="panel rounded-xl p-4 sm:p-5 lg:p-6">
          <div className="mb-2.5 flex items-center justify-between sm:mb-3">
            <h1 className="text-[34px] font-bold leading-tight tracking-tight text-[var(--on-surface)] sm:text-[30px]">Gym Tracker</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--secondary-fixed)] text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm">R</div>
            <div>
              <p className="text-xl font-bold text-[var(--on-surface)] sm:text-2xl">{racha.dias} Dias</p>
              <p className="text-xs text-[var(--on-surface-variant)] sm:text-sm">Racha actual</p>
            </div>
          </div>
          {siguienteRutina && (
            <p className="mt-2 text-[11px] text-[var(--on-surface-variant)] sm:mt-3 sm:text-xs">
              Siguiente recomendada: <strong>{siguienteRutina.nombre} Dia {siguienteRutina.dia}</strong>
            </p>
          )}
        </div>
      </section>

      {sesionPausada && (
        <section className="rounded-xl border border-[#c8dac7] bg-[#ebf6ea] p-3.5 sm:p-4">
          <p className="font-['Lexend'] text-xs text-[#345b39] sm:text-sm">Sesion pausada</p>
          <p className="mt-1 text-sm font-semibold text-[#1f3222] sm:text-base">
            {sesionPausada.rutina.nombre} - Dia {sesionPausada.rutina.dia}
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3">
            <button onClick={onReanudar} className="btn-primary w-full rounded-xl px-3 py-2.5 text-sm">Reanudar</button>
            <button onClick={onDescartarSesion} className="btn-secondary w-full rounded-xl px-3 py-2.5 text-sm">Descartar</button>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {['push', 'pull', 'leg'].map((tipo) => (
          <section key={tipo} className="flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[36px] font-semibold text-[var(--on-surface)] sm:text-2xl">{LANE[tipo].title}</h3>
              <span className="chip">{porTipo[tipo].length} dias</span>
            </div>
            <div className="lane-scroll hide-scrollbar -mx-1 flex gap-3 pb-2 pl-1 pr-3 lg:mx-0 lg:grid lg:grid-cols-1 lg:overflow-visible lg:overscroll-auto lg:touch-auto lg:p-0">
              {porTipo[tipo].map((rutina) => {
                const completada = completadasHoy.includes(rutina.id)
                const esSiguiente = rutina.id === siguienteId
                return (
                  <button
                    key={rutina.id}
                    onClick={() => onSeleccionar(rutina)}
                    className={`lane-card hover-lift min-h-[126px] basis-[calc(100%-3.5rem)] min-w-[17.5rem] max-w-[20.5rem] rounded-xl p-3.5 text-left transition duration-200 active:scale-[0.985] sm:min-h-[136px] sm:p-4 lg:min-w-0 lg:max-w-none lg:basis-auto lg:w-auto ${LANE[tipo].card} ${completada ? 'opacity-55 grayscale-[0.12]' : ''} ${esSiguiente ? 'ring-2 ring-[var(--primary)]' : ''}`}
                  >
                    <div className="mb-2 flex items-center gap-1.5 sm:mb-3 sm:gap-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${LANE[tipo].badge}`}>Dia {rutina.dia}</span>
                      {esSiguiente && <span className="chip px-2.5 text-[10px] border-[var(--primary)] text-[var(--primary)] sm:px-3 sm:text-xs">Sigue</span>}
                      {completada && <span className="chip px-2.5 text-[10px] sm:px-3 sm:text-xs">Hecha hoy</span>}
                    </div>
                    <h4 className="text-xl font-semibold leading-tight sm:text-2xl">{rutina.nombre}</h4>
                    <p className="mt-1.5 text-xs opacity-80 sm:mt-2 sm:text-sm">Iniciar entrenamiento</p>
                  </button>
                )
              })}
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
