import { IMAGENES_EJERCICIOS, ALTERNATIVAS_EJERCICIOS, TODOS_EJERCICIOS } from '../services/rutinasLocales'

export default function ModalEjercicio({ ejercicio, onCerrar, onAlternar }) {
  const imagen = IMAGENES_EJERCICIOS[ejercicio.ejercicio_id]
  const alternativasIds = ALTERNATIVAS_EJERCICIOS[ejercicio.ejercicio_id] || []
  const alternativas = alternativasIds.map((id) => TODOS_EJERCICIOS[id]).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,18,20,0.35)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:items-center" onClick={onCerrar}>
      <div className="panel max-h-[84dvh] w-full max-w-md overflow-y-auto rounded-2xl p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{ejercicio.nombre}</h3>
            <span className="chip mt-1 inline-block">{ejercicio.grupo_muscular}</span>
          </div>
          <button onClick={onCerrar} className="btn-secondary h-10 w-10 rounded-full text-sm">X</button>
        </div>

        {imagen ? (
          <img
            src={imagen}
            alt={ejercicio.nombre}
            className="mb-5 max-h-[220px] w-full rounded-xl border border-[var(--surface-container-highest)] object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="mb-5 flex h-36 items-center justify-center rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] text-sm text-[var(--on-surface-variant)]">
            Sin imagen
          </div>
        )}

        <p className="section-label mb-3">Alternativas</p>

        {alternativas.length === 0 ? (
          <p className="text-sm text-[var(--on-surface-variant)]">Sin alternativas registradas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alternativas.map((alt) => (
              <button
                key={alt.ejercicio_id}
                onClick={() => onAlternar(alt)}
                className="flex items-center justify-between rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] px-4 py-3 text-left active:scale-[0.99]"
              >
                <div>
                  <p className="text-sm font-semibold">{alt.nombre}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">{alt.grupo_muscular}</p>
                </div>
                <span className="text-xs font-medium text-[var(--primary)]">Usar</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
