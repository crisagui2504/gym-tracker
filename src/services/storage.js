const CLAVE_PENDIENTE = 'gym_entrenamiento_pendiente'
const CLAVE_RECORDS = 'gym_records_personales'
const CLAVE_SESION_ACTIVA = 'gym_sesion_activa'
const CLAVE_HISTORIAL = 'gym_historial_ejercicios'
const CLAVE_CICLO_RUTINAS = 'gym_ciclo_rutinas'
const ORDEN_CICLO_RUTINAS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function fechaLocalISO() {
  const ahora = new Date()
  const y = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function guardarLocal(datos) {
  localStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(datos))
}

export function obtenerLocal() {
  const datos = localStorage.getItem(CLAVE_PENDIENTE)
  return datos ? JSON.parse(datos) : null
}

export function limpiarLocal() {
  localStorage.removeItem(CLAVE_PENDIENTE)
}

export function guardarSesionActiva(sesion) {
  localStorage.setItem(CLAVE_SESION_ACTIVA, JSON.stringify({
    ...sesion,
    actualizadaEn: new Date().toISOString(),
  }))
}

export function obtenerSesionActiva() {
  const raw = localStorage.getItem(CLAVE_SESION_ACTIVA)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (!data?.rutina || !data?.rutina.id) return null
    return {
      rutina: data.rutina,
      unidad: data.unidad || 'kg',
      seriesGuardadas: data.seriesGuardadas || {},
      actualizadaEn: data.actualizadaEn || null,
    }
  } catch {
    return null
  }
}

export function limpiarSesionActiva() {
  localStorage.removeItem(CLAVE_SESION_ACTIVA)
}

export function guardarRecords(records) {
  localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records))
}

export function obtenerRecords() {
  const records = localStorage.getItem(CLAVE_RECORDS)
  return records ? JSON.parse(records) : {}
}

export function obtenerRacha() {
  const data = localStorage.getItem('gym_racha')
  return data ? JSON.parse(data) : { dias: 0, ultimaFecha: null }
}

export function actualizarRacha() {
  const racha = obtenerRacha()
  const hoy = new Date().toISOString().split('T')[0]
  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (racha.ultimaFecha === hoy) return racha

  if (racha.ultimaFecha === ayer) {
    const nueva = { dias: racha.dias + 1, ultimaFecha: hoy }
    localStorage.setItem('gym_racha', JSON.stringify(nueva))
    return nueva
  }

  const nueva = { dias: 1, ultimaFecha: hoy }
  localStorage.setItem('gym_racha', JSON.stringify(nueva))
  return nueva
}

export function convertirAKg(valor, unidad) {
  if (unidad === 'kg') return parseFloat(valor)
  return parseFloat((valor * 0.453592).toFixed(2))
}

export function convertirDesdeKg(valor, unidad) {
  if (unidad === 'kg') return parseFloat(valor)
  return parseFloat((valor * 2.20462).toFixed(2))
}

export function actualizarRecord(ejercicioId, nombreEjercicio, pesoKg) {
  const records = obtenerRecords()
  const recordActual = records[ejercicioId]
  if (!recordActual || pesoKg > recordActual.peso) {
    records[ejercicioId] = {
      ejercicio_id: ejercicioId,
      nombre: nombreEjercicio,
      peso: pesoKg,
      fecha: new Date().toISOString().split('T')[0]
    }
    guardarRecords(records)
    return true
  }
  return false
}

export function esNuevoRecord(ejercicioId, pesoKg) {
  const records = obtenerRecords()
  const recordActual = records[ejercicioId]
  return !recordActual || pesoKg > recordActual.peso
}

export function guardarRegistroHistorial({ ejercicioId, nombreEjercicio, pesoKg, repeticiones }) {
  if (!ejercicioId || !pesoKg) return
  const historial = obtenerHistorialTodos()
  const clave = String(ejercicioId)
  const actual = historial[clave] || []
  actual.push({
    ejercicio_id: ejercicioId,
    nombre: nombreEjercicio || '',
    peso: parseFloat(pesoKg),
    repeticiones: repeticiones ? parseInt(repeticiones, 10) : null,
    fecha: new Date().toISOString(),
  })
  historial[clave] = actual
  localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial))
}

export function obtenerHistorialTodos() {
  const data = localStorage.getItem(CLAVE_HISTORIAL)
  if (!data) return {}
  try {
    const parsed = JSON.parse(data)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function obtenerHistorialEjercicio(ejercicioId) {
  const historial = obtenerHistorialTodos()
  return historial[String(ejercicioId)] || []
}

export function obtenerEstadoCicloRutinas() {
  const today = fechaLocalISO()
  const raw = localStorage.getItem(CLAVE_CICLO_RUTINAS)
  if (!raw) {
    return { nextRutinaId: ORDEN_CICLO_RUTINAS[0], completadasHoy: [], ultimaFecha: today }
  }
  try {
    const parsed = JSON.parse(raw)
    const mismaFecha = parsed.ultimaFecha === today
    return {
      nextRutinaId: ORDEN_CICLO_RUTINAS.includes(parsed.nextRutinaId) ? parsed.nextRutinaId : ORDEN_CICLO_RUTINAS[0],
      completadasHoy: mismaFecha && Array.isArray(parsed.completadasHoy) ? parsed.completadasHoy : [],
      ultimaFecha: mismaFecha ? parsed.ultimaFecha : today,
      ultimaRutinaId: parsed.ultimaRutinaId || null,
    }
  } catch {
    return { nextRutinaId: ORDEN_CICLO_RUTINAS[0], completadasHoy: [], ultimaFecha: today }
  }
}

export function marcarRutinaCompletada(rutinaId) {
  if (!rutinaId) return obtenerEstadoCicloRutinas()

  const today = fechaLocalISO()
  const estado = obtenerEstadoCicloRutinas()
  const completadas = estado.ultimaFecha === today ? [...estado.completadasHoy] : []
  if (!completadas.includes(rutinaId)) completadas.push(rutinaId)

  const idx = ORDEN_CICLO_RUTINAS.indexOf(rutinaId)
  const nextRutinaId = idx >= 0 ? ORDEN_CICLO_RUTINAS[(idx + 1) % ORDEN_CICLO_RUTINAS.length] : estado.nextRutinaId

  const nuevo = {
    nextRutinaId,
    completadasHoy: completadas,
    ultimaFecha: today,
    ultimaRutinaId: rutinaId,
  }
  localStorage.setItem(CLAVE_CICLO_RUTINAS, JSON.stringify(nuevo))
  return nuevo
}
