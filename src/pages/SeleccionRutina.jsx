import { useState, useEffect, useRef } from 'react'
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
    card: 'bg-[var(--lane-push-bg)] text-[var(--lane-push-text)]',
    badge: 'bg-[var(--lane-push-badge-bg)] text-[var(--lane-push-badge-text)]',
  },
  pull: {
    title: 'Pull',
    card: 'bg-[var(--lane-pull-bg)] text-[var(--lane-pull-text)]',
    badge: 'bg-[var(--lane-pull-badge-bg)] text-[var(--lane-pull-badge-text)]',
  },
  leg: {
    title: 'Legs',
    card: 'bg-[var(--lane-leg-bg)] text-[var(--lane-leg-text)]',
    badge: 'bg-[var(--lane-leg-badge-bg)] text-[var(--lane-leg-badge-text)]',
  },
}

function CarruselLane({ tipo, rutinas, completadasHoy, siguienteId, onSeleccionar }) {
  const trackRef = useRef(null)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)
  const isDragging = useRef(false)
  const didDrag = useRef(false)

  const onPointerDown = (e) => {
    isDragging.current = true
    didDrag.current = false
    startX.current = e.clientX
    startScrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 4) didDrag.current = true
    trackRef.current.scrollLeft = startScrollLeft.current - dx
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  const lane = LANE[tipo]

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-2xl font-semibold text-[var(--on-surface)]">{lane.title}</h3>
        <span className="chip">{rutinas.length} días</span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex gap-3 overflow-x-auto px-4 pb-3"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
        }}
      >
        {rutinas.map((rutina) => {
          const completada = completadasHoy.includes(rutina.id)
          const esSiguiente = rutina.id === siguienteId

          return (
            <button
              key={rutina.id}
              onPointerUp={() => {
                if (!didDrag.current) onSeleccionar(rutina)
              }}
              className={`flex-shrink-0 rounded-2xl p-4 text-left transition duration-150 active:scale-[0.97] ${lane.card} ${completada ? 'opacity-50' : ''} ${esSiguiente ? 'ring-2 ring-[var(--primary)]' : ''}`}
              style={{
                width: 'calc(80vw)',
                maxWidth: '280px',
                minHeight: '140px',
                scrollSnapAlign: 'start',
                boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
              }}
            >
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lane.badge}`}>
                  Día {rutina.dia}
                </span>
                {esSiguiente && (
                  <span className="rounded-full border border-[var(--primary)] px-2.5 py-1 text-[10px] font-semibold text-[var(--primary)]">
                    Siguiente
                  </span>
                )}
                {completada && (
                  <span className="rounded-full border border-[var(--outline-variant)] px-2.5 py-1 text-[10px] text-[var(--on-surface-variant)]">
                    Hecha hoy
                  </span>
                )}
              </div>
              <h4 className="text-2xl font-bold leading-tight">{rutina.nombre}</h4>
              <p className="mt-2 text-sm opacity-70">Iniciar entrenamiento →</p>
            </button>
          )
        })}

        <div className="flex-shrink-0 w-2" aria-hidden="true" />
      </div>
    </section>
  )
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
    getRachaServidor().then((data) => { if (data) setRacha(data) })
  }, [])

  useEffect(() => {
    document.body.classList.toggle('theme-dark', temaOscuro)
    localStorage.setItem('gym_theme', temaOscuro ? 'dark' : 'light')
  }, [temaOscuro])

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
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
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-5 pb-24 pt-6">

      <button
        onClick={() => setTemaOscuro((p) => !p)}
        className="theme-toggle fixed right-4 top-4 z-40"
        aria-label="Cambiar tema"
      >
        {temaOscuro ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="flex flex-col gap-1 px-4">
        <p className="text-sm capitalize text-[var(--on-surface-variant)]">{hoy}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--on-surface)]">Gym Tracker</h1>
      </div>

      <div className="panel mx-4 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-fixed)] text-base font-bold">
            🔥
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--on-surface)]">{racha.dias} días</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Racha actual</p>
          </div>
        </div>
        {siguienteRutina && (
          <p className="mt-3 text-xs text-[var(--on-surface-variant)]">
            Siguiente recomendada:{' '}
            <strong className="text-[var(--on-surface)]">
              {siguienteRutina.nombre} Día {siguienteRutina.dia}
            </strong>
          </p>
        )}
      </div>

      {sesionPausada && (
        <div className="mx-4 rounded-2xl border border-[#c8dac7] bg-[#ebf6ea] p-4">
          <p className="text-xs font-semibold text-[#345b39]">Sesión pausada</p>
          <p className="mt-1 text-base font-bold text-[#1f3222]">
            {sesionPausada.rutina.nombre} — Día {sesionPausada.rutina.dia}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={onReanudar} className="btn-primary rounded-xl px-3 py-2.5 text-sm">Reanudar</button>
            <button onClick={onDescartarSesion} className="btn-secondary rounded-xl px-3 py-2.5 text-sm">Descartar</button>
          </div>
        </div>
      )}

      {['push', 'pull', 'leg'].map((tipo) => (
        <CarruselLane
          key={tipo}
          tipo={tipo}
          rutinas={porTipo[tipo]}
          completadasHoy={completadasHoy}
          siguienteId={siguienteId}
          onSeleccionar={onSeleccionar}
        />
      ))}

      <div className="px-4">
        <button onClick={onDashboard} className="btn-primary w-full rounded-2xl px-5 py-4 text-sm">
          Ver mi progreso
        </button>
      </div>

    </main>
  )
}