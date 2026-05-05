const BASE_URL = 'http://20.172.67.68/api'
const USAR_DATOS_LOCALES = false

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

export async function getRachaServidor() {
  try {
    const res = await fetch(`${BASE_URL}/obtener_racha.php`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return null
  }
}

export async function actualizarRachaServidor() {
  try {
    const res = await fetch(`${BASE_URL}/actualizar_racha.php`, { method: 'POST' })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return null
  }
}

export async function getDatosUsuario() {
  try {
    const res = await fetch(`${BASE_URL}/obtener_datos_usuario.php`)
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return null
  }
}

export async function guardarRecord(ejercicioId, nombreEjercicio, pesoKg) {
  try {
    await fetch(`${BASE_URL}/guardar_record.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ejercicio_id: ejercicioId,
        nombre_ejercicio: nombreEjercicio,
        peso_kg: pesoKg,
        fecha: new Date().toISOString().split('T')[0]
      })
    })
  } catch { }
}

export async function guardarHistorialEjercicioServidor(ejercicioId, nombreEjercicio, pesoKg, repeticiones) {
  try {
    await fetch(`${BASE_URL}/guardar_historial_ejercicio.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ejercicio_id: ejercicioId,
        nombre_ejercicio: nombreEjercicio,
        peso_kg: pesoKg,
        repeticiones,
        fecha: new Date().toISOString()
      })
    })
  } catch { }
}

export async function guardarCicloRutinas(ciclo) {
  try {
    await fetch(`${BASE_URL}/guardar_ciclo_rutinas.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ciclo)
    })
  } catch { }
}