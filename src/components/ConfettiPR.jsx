import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiPR({ nombre, peso, onCerrar }) {
  useEffect(() => {
    confetti({ particleCount: 160, spread: 85, origin: { y: 0.62 } })
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,18,20,0.35)] px-4">
      <div className="panel w-full max-w-sm rounded-2xl p-6 text-center">
        <p className="mb-1 font-['Lexend'] text-xs tracking-[0.12em] text-[var(--on-surface-variant)]">NUEVO RECORD</p>
        <h2 className="mb-2 text-2xl font-semibold">Excelente trabajo</h2>
        <p className="text-base font-semibold">{nombre}</p>
        <p className="mono mb-5 mt-1 text-4xl font-bold text-[var(--primary)]">{peso} kg</p>
        <button onClick={onCerrar} className="btn-primary w-full rounded-xl px-5 py-3 text-sm">Seguir entrenando</button>
      </div>
    </div>
  )
}
