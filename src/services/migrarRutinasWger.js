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
        const wgerExerciseId = exerciseMap[ej.ejercicio_id] || exerciseMap[String(ej.ejercicio_id)]

        if (!wgerExerciseId) {
          console.warn(`Omitiendo "${ej.nombre}" - No esta en el WGER_EXERCISE_MAP`)
          continue
        }

        const seriesInt = parseInt(ej.series_objetivo, 10) || 3
        const repsString = String(ej.reps_objetivo || '8')

        // ¡CORRECCIÓN AQUÍ! WGER ahora usa /slot/ en lugar de /set/
        const slotResponse = await wgerPost('/slot/', {
          day: dayId,
          order: ej.orden,
          sets: seriesInt, 
        }, token.trim())

        const slotId = slotResponse.id

        // ¡CORRECCIÓN AQUÍ! WGER ahora usa /slot-entry/ en lugar de /setting/
        await wgerPost('/slot-entry/', {
            slot: slotId,
            exercise: wgerExerciseId,
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