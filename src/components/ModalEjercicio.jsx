import { IMAGENES_EJERCICIOS, TODOS_EJERCICIOS } from '../services/rutinasLocales'

export default function ModalEjercicio({ ejercicio, onCerrar, onAlternar, ejerciciosEnRutina = [] }) {
  // Filtrar alternativas: mismo grupo muscular estrictamente
  const alternativas = Object.values(TODOS_EJERCICIOS).filter((ej) => {
    if (ej.ejercicio_id === ejercicio.ejercicio_id) return false
    if (ej.grupo_muscular !== ejercicio.grupo_muscular) return false
    return true
  })

  // Detectar duplicados en la rutina actual
  const idsEnRutina = ejerciciosEnRutina.map((e) => e.ejercicio_id)

  const imagen = IMAGENES_EJERCICIOS[ejercicio.ejercicio_id]

  const handleAlternar = (alternativa) => {
    // Verificar si la alternativa ya existe en la rutina
    const posicionDuplicado = ejerciciosEnRutina.findIndex(
      (e) => e.ejercicio_id === alternativa.ejercicio_id
    )

    if (posicionDuplicado !== -1) {
      // Opción B: Swap — intercambiar posiciones
      onAlternar(alternativa, { swap: true, posicionDuplicado })
    } else {
      onAlternar(alternativa, { swap: false })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,18,20,0.35)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:items-center"
      onClick={onCerrar}
    >
      <div
        className="panel max-h-[84dvh] w-full max-w-md overflow-y-auto rounded-2xl p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{ejercicio.nombre}</h3>
            <span className="chip mt-1 inline-block">{ejercicio.grupo_muscular}</span>
          </div>
          <button onClick={onCerrar} className="btn-secondary h-10 w-10 rounded-full text-sm">✕</button>
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

        <p className="section-label mb-1">Grupo muscular: {ejercicio.grupo_muscular}</p>
        <p className="mb-3 text-xs text-[var(--on-surface-variant)]">
          Solo se muestran alternativas del mismo grupo muscular
        </p>

        {alternativas.length === 0 ? (
          <p className="text-sm text-[var(--on-surface-variant)]">Sin alternativas del mismo grupo muscular.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alternativas.map((alt) => {
              const esDuplicado = idsEnRutina.includes(alt.ejercicio_id)
              return (
                <button
                  key={alt.ejercicio_id}
                  onClick={() => handleAlternar(alt)}
                  className="flex items-center justify-between rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] px-4 py-3 text-left active:scale-[0.99]"
                >
                  <div>
                    <p className="text-sm font-semibold">{alt.nombre}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{alt.grupo_muscular}</p>
                    {esDuplicado && (
                      <p className="mt-0.5 text-xs font-semibold text-amber-600">
                        ↕ Ya en tu rutina — se hará swap de posición
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[var(--primary)]">
                    {esDuplicado ? 'Swap' : 'Usar'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}