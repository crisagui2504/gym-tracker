import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiPR({ nombre, peso, onCerrar }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    })
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-3xl p-8 mx-4 text-center border border-yellow-500">
        <p className="text-5xl mb-4">🏆</p>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">¡Nuevo Récord!</h2>
        <p className="text-white text-lg font-bold mb-1">{nombre}</p>
        <p className="text-yellow-300 text-3xl font-bold mb-6">{peso} kg</p>
        <button
          onClick={onCerrar}
          className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-2xl active:scale-95 transition-transform"
        >
          ¡A seguir rompiendo! 💪
        </button>
      </div>
    </div>
  )
}