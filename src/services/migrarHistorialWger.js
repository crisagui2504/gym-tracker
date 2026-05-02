import { TODOS_EJERCICIOS } from './rutinasLocales'
import { obtenerHistorialTodos } from './storage'

const BASE_URL = 'https://wger.de/api/v2'
const PAUSA_MS = 500

// Completa este mapa con los IDs reales de WGER antes de ejecutar una migracion real.
// Formato recomendado: ID local de tu app -> ID de ejercicio en WGER.
export const WGER_EXERCISE_MAP = {
  // 1: 192,  // Press de Banca con Barra
  // 13: 111, // Sentadilla Libre con Barra
  // 14: 105, // Peso Muerto Rumano con Barra
  // 11: 88,  // Curl de Biceps con Barra
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fechaSoloDia(fechaRaw) {
  if (!fechaRaw) return new Date().toISOString().slice(0, 10)
  const fecha = new Date(fechaRaw)
  if (Number.isNaN(fecha.getTime())) return String(fechaRaw).slice(0, 10)
  return fecha.toISOString().slice(0, 10)
}

export function obtenerLogsLocalesParaWger(exerciseMap = WGER_EXERCISE_MAP) {
  const historial = obtenerHistorialTodos()

  return Object.entries(historial).flatMap(([ejercicioId, registros]) => {
    const ejercicio = TODOS_EJERCICIOS[ejercicioId]
    if (!Array.isArray(registros)) return []

    return registros
      .filter((registro) => Number(registro?.peso) > 0 && Number(registro?.repeticiones) > 0)
      .map((registro) => ({
        ejercicioId: Number(ejercicioId),
        nombre: registro.nombre || ejercicio?.nombre || `Ejercicio ${ejercicioId}`,
        repeticiones: Number(registro.repeticiones),
        peso: Number(registro.peso),
        fecha: fechaSoloDia(registro.fecha),
        wgerExerciseId: exerciseMap[Number(ejercicioId)] || exerciseMap[String(ejercicioId)] || null,
      }))
  })
}

export function resumirMigracionWger(exerciseMap = WGER_EXERCISE_MAP) {
  const logs = obtenerLogsLocalesParaWger(exerciseMap)
  const mapeados = logs.filter((log) => log.wgerExerciseId)
  const sinMapear = logs.filter((log) => !log.wgerExerciseId)
  const ejerciciosSinMapear = [...new Map(sinMapear.map((log) => [log.ejercicioId, log])).values()]

  return {
    total: logs.length,
    mapeados: mapeados.length,
    sinMapear: sinMapear.length,
    ejerciciosSinMapear,
  }
}

async function enviarLogAWger(log, token) {
  const payload = {
    exercise: log.wgerExerciseId,
    reps: log.repeticiones,
    weight: log.peso,
    date: log.fecha,
  }

  const response = await fetch(`${BASE_URL}/workoutlog/`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detalle = null
    try {
      detalle = await response.json()
    } catch {
      detalle = await response.text()
    }
    throw new Error(JSON.stringify(detalle))
  }

  return response.json()
}

export async function ejecutarMigracionWger({ token, dryRun = true, exerciseMap = WGER_EXERCISE_MAP, onProgress } = {}) {
  const logs = obtenerLogsLocalesParaWger(exerciseMap)
  const logsMapeados = logs.filter((log) => log.wgerExerciseId)
  const omitidos = logs.filter((log) => !log.wgerExerciseId)
  const resultado = { enviados: 0, fallidos: 0, omitidos: omitidos.length, errores: [] }

  if (!dryRun && !token?.trim()) {
    throw new Error('Pega tu token de WGER antes de ejecutar la migracion real.')
  }

  for (const [index, log] of logsMapeados.entries()) {
    onProgress?.({ actual: index + 1, total: logsMapeados.length, log, dryRun })

    if (dryRun) {
      resultado.enviados += 1
      continue
    }

    try {
      await enviarLogAWger(log, token.trim())
      resultado.enviados += 1
    } catch (error) {
      resultado.fallidos += 1
      resultado.errores.push({ log, error: error.message })
    }

    await esperar(PAUSA_MS)
  }

  return resultado
}
