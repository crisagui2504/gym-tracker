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

  // Manejo de errores corregido (evita el "body stream already read")
  if (!response.ok) {
    const errorText = await response.text()
    let detalle = errorText
    try {
      detalle = JSON.parse(errorText)
    } catch (e) {
      // Si no es JSON, se queda como texto plano
    }
    throw new Error(`Error en ${endpoint}: ${typeof detalle === 'object' ? JSON.stringify(detalle) : detalle}`)
  }

  return response.json()
}

export async function ejecutarMigracionRutinas(token, exerciseMap = WGER_EXERCISE_MAP) {
  if (!token?.trim()) {
    console.error('No se proporciono un token.')
    return false
  }

  console.log('Iniciando migracion de rutinas a WGER...')

  try {
    console.log('Creando Entrenamiento maestro...')
    
    // ¡CORRECCIÓN!: El endpoint en WGER es /routine/
    const workout = await wgerPost('/routine/', {
      name: 'Ciclo de 9 Dias (Migrado)',
      description: 'Rutina importada automaticamente desde la Web App',
    }, token.trim())

    const workoutId = workout.id
    console.log(`Entrenamiento creado con ID: ${workoutId}`)

    for (const [key, rutina] of Object.entries(RUTINAS_LOCALES)) {
      console.log(`Creando Dia para Rutina ${key}...`)

      const day = await wgerPost('/day/', {
        training: workoutId, // En WGER, la llave foránea se llama "training"
        description: `Dia ${key}`,
        day: [],
      }, token.trim())

      const dayId = day.id

      for (const ej of rutina.ejercicios) {
        const wgerExerciseId = exerciseMap[ej.ejercicio_id] || exerciseMap[String(ej.ejercicio_id)]

        if (!wgerExerciseId) {
          console.warn(`Omitiendo "${ej.nombre}" - No esta en el WGER_EXERCISE_MAP`)
          continue
        }

        const seriesInt = parseInt(ej.series_objetivo, 10) || 3
        const repsString = String(ej.reps_objetivo || '8')

        // 1. Crear el Set (agrupador)
        const setResponse = await wgerPost('/set/', {
          day: dayId,
          order: ej.orden,
          sets: seriesInt, 
        }, token.trim())

        const setId = setResponse.id

        // 2. Crear el Setting (donde va el ejercicio)
        await wgerPost('/setting/', {
            set: setId,
            exercise: wgerExerciseId,
            reps: repsString
        }, token.trim())

        console.log(`  - Ejercicio anadido: ${ej.nombre}`)
        await esperar(PAUSA_MS)
      }
    }

    console.log('RUTINAS MIGRADAS EXITOSAMENTE. Revisa tu app de iOS.')
    return true
  } catch (error) {
    console.error('Fallo la migracion de rutinas:', error.message)
    return false
  }
}