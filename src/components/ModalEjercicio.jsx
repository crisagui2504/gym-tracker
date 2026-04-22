import { IMAGENES_EJERCICIOS, ALTERNATIVAS_EJERCICIOS, TODOS_EJERCICIOS } from '../services/rutinasLocales'

export default function ModalEjercicio({ ejercicio, onCerrar, onAlternar }) {
  const imagen = IMAGENES_EJERCICIOS[ejercicio.ejercicio_id]
  const alternativasIds = ALTERNATIVAS_EJERCICIOS[ejercicio.ejercicio_id] || []
  const alternativas = alternativasIds.map((id) => TODOS_EJERCICIOS[id]).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(2,10,20,0.8)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:items-center" onClick={onCerrar}>
      <div
        className="panel max-h-[84dvh] w-full max-w-md overflow-y-auto rounded-3xl p-4 sm:max-h-[88dvh] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold leading-tight">{ejercicio.nombre}</h3>
            <span className="chip mt-1 inline-block">{ejercicio.grupo_muscular}</span>
          </div>
          <button onClick={onCerrar} className="btn-secondary h-10 w-10 rounded-full text-sm">
            X
          </button>
        </div>

        {imagen ? (
          <img
            src={imagen}
            alt={ejercicio.nombre}
            className="mb-5 max-h-[220px] w-full rounded-2xl border border-sky-300/15 object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="mb-5 flex h-36 w-full items-center justify-center rounded-2xl border border-sky-300/15 bg-slate-900/40">
            <span className="text-sm text-[var(--text-faint)]">Sin imagen</span>
          </div>
        )}

        <p className="section-label mb-3">Alternativas</p>

        {alternativas.length === 0 ? (
          <p className="text-sm text-[var(--text-soft)]">Sin alternativas registradas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alternativas.map((alt) => (
              <button
                key={alt.ejercicio_id}
                onClick={() => onAlternar(alt)}
                className="flex items-center justify-between rounded-2xl border border-sky-300/20 bg-slate-900/45 px-4 py-3 text-left transition hover:bg-sky-400/10 active:scale-[0.99]"
              >
                <div>
                  <p className="text-sm font-bold">{alt.nombre}</p>
                  <p className="text-xs text-[var(--text-faint)]">{alt.grupo_muscular}</p>
                </div>
                <span className="text-xs font-semibold text-sky-200">Usar</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
