import { ejecutarMigracionWger, WGER_EXERCISE_MAP } from './migrarHistorialWger'

// Wrapper temporal compatible con:
// import { ejecutarMigracion } from '../services/migrarHistorial'
export async function ejecutarMigracion() {
  const token = window.prompt('Pega tu token de WGER. No se guardara en el codigo.')
  if (!token) {
    console.warn('Migracion cancelada: no se ingreso token de WGER.')
    return null
  }

  const confirmar = window.confirm(
    'Esto subira tu historial local a WGER. Recomendado: primero prueba desde el panel de Dashboard en modo simulacion. Continuar?'
  )
  if (!confirmar) {
    console.warn('Migracion cancelada por el usuario.')
    return null
  }

  console.log('Extrayendo historial local e iniciando subida a WGER...')
  const resultado = await ejecutarMigracionWger({
    token,
    dryRun: false,
    exerciseMap: WGER_EXERCISE_MAP,
    onProgress: ({ actual, total, log }) => {
      console.log(`${actual}/${total}: ${log.nombre} - ${log.peso}kg x ${log.repeticiones} reps`)
    },
  })

  console.log('Migracion completada:', resultado)
  return resultado
}

export { WGER_EXERCISE_MAP as EXERCISE_MAP }
