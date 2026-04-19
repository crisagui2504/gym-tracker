const BASE_URL = '/api'
const USAR_DATOS_LOCALES = true

import { RUTINAS_LOCALES } from './rutinasLocales'

export async function getRutina(rutinaId) {
  if (USAR_DATOS_LOCALES) {
    return RUTINAS_LOCALES[rutinaId] || { ejercicios: [] }
  }
  const res = await fetch(`${BASE_URL}/obtener_rutina_del_dia.php?rutina_id=${rutinaId}`)
  if (!res.ok) throw new Error('Error al obtener la rutina')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

export async function guardarEntrenamiento(rutinaId, seriesGuardadas) {
  if (USAR_DATOS_LOCALES) {
    console.log('Guardado local:', { rutinaId, seriesGuardadas })
    return { ok: true }
  }
  try {
    const res = await fetch(`${BASE_URL}/guardar_entrenamiento_completo.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rutina_id: rutinaId, series: seriesGuardadas })
    })
    if (!res.ok) throw new Error('Error del servidor')
    return await res.json()
  } catch {
    return { offline: true }
  }
}

export async function getEstadisticas(ejercicioId) {
  const res = await fetch(`${BASE_URL}/obtener_estadisticas.php?ejercicio_id=${ejercicioId}`)
  if (!res.ok) throw new Error('Error al obtener estadísticas')
  return res.json()
}