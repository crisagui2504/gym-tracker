import { IMAGENES_EJERCICIOS, ALTERNATIVAS_EJERCICIOS, TODOS_EJERCICIOS } from '../services/rutinasLocales'

export default function ModalEjercicio({ ejercicio, onCerrar, onAlternar }) {
  const imagen = IMAGENES_EJERCICIOS[ejercicio.ejercicio_id]
  const alternativasIds = ALTERNATIVAS_EJERCICIOS[ejercicio.ejercicio_id] || []
  const alternativas = alternativasIds.map(id => TODOS_EJERCICIOS[id]).filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-5 pb-10"
        style={{ background: '#0D1117', border: '1px solid #161B22' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-lg text-white leading-tight">{ejercicio.nombre}</h3>
            <span className="text-xs font-semibold rounded-full px-2.5 py-1 mt-1 inline-block" style={{ background: '#161B22', color: '#6B7280' }}>
              {ejercicio.grupo_muscular}
            </span>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg"
            style={{ background: '#161B22' }}
          >
            ×
          </button>
        </div>

        {imagen ? (
          <img
            src={imagen}
            alt={ejercicio.nombre}
            className="w-full rounded-2xl object-cover mb-5"
            style={{ maxHeight: '200px', background: '#161B22' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-36 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#161B22' }}>
            <span className="text-gray-600 text-sm">Sin imagen</span>
          </div>
        )}

        <p className="text-gray-600 text-xs font-semibold tracking-widest uppercase mb-3">
          Alternativas
        </p>

        {alternativas.length === 0 ? (
          <p className="text-gray-700 text-sm">Sin alternativas registradas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alternativas.map(alt => (
              <button
                key={alt.ejercicio_id}
                onClick={() => onAlternar(alt)}
                className="rounded-2xl px-4 py-3 flex items-center justify-between active:scale-95 transition-transform"
                style={{ background: '#161B22', border: '1px solid #21262D' }}
              >
                <div className="text-left">
                  <p className="text-white text-sm font-bold">{alt.nombre}</p>
                  <p className="text-gray-600 text-xs">{alt.grupo_muscular}</p>
                </div>
                <span className="text-blue-400 text-sm font-semibold">Usar →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}