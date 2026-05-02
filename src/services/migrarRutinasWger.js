import { RUTINAS_LOCALES } from './rutinasLocales'
import { WGER_EXERCISE_MAP } from './migrarHistorialWger'

const BASE_URL = 'https://wger.de/api/v2'
const PAUSA_MS = 500

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function wgerPost(endpoint, payload, token) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let detalle = errorText
    try {
      detalle = JSON.parse(errorText)
    } catch (e) {}
    throw new Error(`Error en ${endpoint}: ${typeof detalle === 'object' ? JSON.stringify(detalle) : detalle}`)
  }

  return response.json()
}

// CACHÉ PARA NO SATURAR LA API CON PREGUNTAS REPETIDAS
const cacheIdsReales = {}

// FUNCIÓN INTELIGENTE PARA OBTENER EL ID DE LA TRADUCCIÓN
async function obtenerIdReal(baseId) {
  if (cacheIdsReales[baseId]) return cacheIdsReales[baseId]

  try {
    // Preguntamos a WGER por la traducción al español (language=21)
    let res = await fetch(`${BASE_URL}/exercise/?exercise_base=${baseId}&language=21`)
    let data = await res.json()

    if (data.results && data.results.length > 0) {
      cacheIdsReales[baseId] = data.results[0].id
      return data.results[0].id
    }

    // Si no hay traducción en español, pedimos la de inglés o cualquiera
    res = await fetch(`${BASE_URL}/exercise/?exercise_base=${baseId}`)
    data = await res.json()

    if (data.results && data.results.length > 0) {
      cacheIdsReales[baseId] = data.results[0].id
      return data.results[0].id
    }
  } catch (e) {
    console.warn(`No se pudo obtener el ID real para la base ${baseId}`)
  }

  return baseId // Fallback de emergencia
}

export async function ejecutarMigracionRutinas(token, exerciseMap = WGER_EXERCISE_MAP) {
  if (!token?.trim()) {
    console.error('No se proporciono un token.')
    return false
  }

  console.log('Iniciando migracion de rutinas a WGER...')

  try {
    console.log('Creando Entrenamiento maestro...')
    
    const hoy = new Date()
    const fechaInicio = hoy.toISOString().split('T')[0]
    hoy.setFullYear(hoy.getFullYear() + 1) 
    const fechaFin = hoy.toISOString().split('T')[0]

    const workout = await wgerPost('/routine/', {
      name: 'Ciclo de 9 Dias (Migrado)',
      description: 'Rutina importada automaticamente desde la Web App',
      start: fechaInicio,
      end: fechaFin
    }, token.trim())

    const workoutId = workout.id
    console.log(`Entrenamiento creado con ID: ${workoutId}`)

    for (const [key, rutina] of Object.entries(RUTINAS_LOCALES)) {
      console.log(`Creando Dia para Rutina ${key}...`)

      const day = await wgerPost('/day/', {
        routine: workoutId, 
        description: `Dia ${key}`,
        day: [],
      }, token.trim())

      const dayId = day.id

      for (const ej of rutina.ejercicios) {
        const wgerExerciseBaseId = exerciseMap[ej.ejercicio_id] || exerciseMap[String(ej.ejercicio_id)]

        if (!wgerExerciseBaseId) {
          console.warn(`Omitiendo "${ej.nombre}" - No esta en el WGER_EXERCISE_MAP`)
          continue
        }

        // --- EL PASO CLAVE: Traducir el ID Base al ID Real ---
        const realExerciseId = await obtenerIdReal(wgerExerciseBaseId)

        const seriesInt = parseInt(ej.series_objetivo, 10) || 3
        const repsString = String(ej.reps_objetivo || '8')

        const slotResponse = await wgerPost('/slot/', {
          day: dayId,
          order: ej.orden,
          sets: seriesInt, 
        }, token.trim())

        const slotId = slotResponse.id

        await wgerPost('/slot-entry/', {
            slot: slotId,
            exercise: realExerciseId, // AHORA SÍ, LE PASAMOS EL ID CORRECTO
            reps: repsString
        }, token.trim())

        console.log(`  - Ejercicio añadido: ${ej.nombre}`)
        await esperar(PAUSA_MS)
      }
    }

    console.log('🎉 RUTINAS MIGRADAS EXITOSAMENTE. Revisa tu app de iOS.')
    return true
  } catch (error) {
    console.error('❌ Fallo la migracion de rutinas:', error.message)
    return false
  }
}