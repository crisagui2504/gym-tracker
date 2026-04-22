import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiPR({ nombre, peso, onCerrar }) {
  useEffect(() => {
    confetti({
      particleCount: 160,
      spread: 85,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,10,20,0.82)] px-4">
      <div className="panel max-w-sm rounded-3xl border-amber-300/35 p-7 text-center">
        <div className="mb-3 text-xs font-bold tracking-[0.18em] text-amber-100/80">NUEVO RECORD</div>
        <h2 className="mb-2 text-2xl font-extrabold text-amber-200">Excelente trabajo</h2>
        <p className="mb-1 text-base font-bold text-slate-100">{nombre}</p>
        <p className="mono mb-6 text-4xl font-black text-amber-100">{peso} kg</p>
        <button
          onClick={onCerrar}
          className="w-full rounded-2xl border border-amber-300/50 bg-amber-300/15 px-6 py-3 font-bold text-amber-100 transition hover:bg-amber-300/25 active:scale-[0.99]"
        >
          Seguir entrenando
        </button>
      </div>
    </div>
  )
}
