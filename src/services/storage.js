const CLAVE_PENDIENTE = 'gym_entrenamiento_pendiente'
const CLAVE_RECORDS = 'gym_records_personales'
const CLAVE_SESION_ACTIVA = 'gym_sesion_activa'
const CLAVE_HISTORIAL = 'gym_historial_ejercicios'
const CLAVE_CICLO_RUTINAS = 'gym_ciclo_rutinas'
const CLAVE_DEUDA_MUSCULAR = 'gym_deuda_muscular'
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

export function obtenerUltimasSeries(ejercicioId) {
  const historial = obtenerHistorialEjercicio(ejercicioId)
  if (!historial.length) return null

  // Agrupar por fecha y tomar la más reciente
  const porFecha = {}
  historial.forEach((entry) => {
    const fecha = entry.fecha.split('T')[0]
    if (!porFecha[fecha]) porFecha[fecha] = []
    porFecha[fecha].push(entry)
  })

  const fechas = Object.keys(porFecha).sort().reverse()
  if (!fechas.length) return null

  return porFecha[fechas[0]]
}

export function calcularSugerenciaProgresion(ejercicioId, repsObjetivo) {
  const ultimasSeries = obtenerUltimasSeries(ejercicioId)
  if (!ultimasSeries || !ultimasSeries.length) return null

  // Parsear rango de reps objetivo (ej: "6-8" → min=6, max=8)
  const partes = String(repsObjetivo).split('-')
  const repsMin = parseInt(partes[0], 10)
  const repsMax = parseInt(partes[partes.length - 1], 10)

  const pesoBase = ultimasSeries[0].peso
  const todasAlMax = ultimasSeries.every(
    (s) => s.repeticiones !== null && s.repeticiones >= repsMax
  )
  const hayEstancamiento = ultimasSeries.some(
    (s) => s.repeticiones !== null && s.repeticiones < repsMin
  )

  if (todasAlMax) {
    // Lograste el máximo en todas → sube 2.5 kg, vuelve al mínimo de reps
    return {
      peso: redondearPeso(pesoBase + 2.5),
      repsObjetivo: repsMin,
      mensaje: `+2.5 kg respecto a tu sesión anterior`,
      tipo: 'subir',
    }
  }

  if (hayEstancamiento) {
    // No alcanzaste el mínimo → mismo peso, intenta una rep más
    const mejorReps = Math.max(...ultimasSeries.map((s) => s.repeticiones || 0))
    return {
      peso: redondearPeso(pesoBase),
      repsObjetivo: Math.min(mejorReps + 1, repsMax),
      mensaje: `Mismo peso, intenta ${Math.min(mejorReps + 1, repsMax)} reps`,
      tipo: 'mantener',
    }
  }

  // Progreso normal → mismo peso y reps
  return {
    peso: redondearPeso(pesoBase),
    repsObjetivo: null,
    mensaje: `Igual que la semana pasada`,
    tipo: 'igual',
  }
}

function redondearPeso(valor, paso = 2.5) {
  return Math.max(paso, Math.round(valor / paso) * paso)
}

export function detectarFatigaYReducirSeries(seriesCompletadas, seriesObjetivo) {
  if (!seriesCompletadas || seriesCompletadas.length < 2) return null

  const ultimasSeries = obtenerUltimasSeries(
    seriesCompletadas[0]?.ejercicioId
  )
  if (!ultimasSeries) return null

  const pesoPromedioPasado = ultimasSeries.reduce((s, e) => s + e.peso, 0) / ultimasSeries.length
  const pesoActual = seriesCompletadas[seriesCompletadas.length - 1]?.peso_kg || 0

  const caida = (pesoPromedioPasado - pesoActual) / pesoPromedioPasado
  if (caida > 0.15) {
    // Cayó más del 15% → sugiere reducir series
    const seriesReducidas = Math.max(2, parseInt(seriesObjetivo, 10) - 1)
    return {
      sugerencia: seriesReducidas,
      mensaje: `Fatiga detectada. Considera reducir a ${seriesReducidas} series en los siguientes ejercicios.`,
    }
  }
  return null
}

export function registrarDeudaMuscular(grupoMuscular) {
  const deudas = obtenerDeudasMusculares()
  if (!deudas.includes(grupoMuscular)) {
    deudas.push(grupoMuscular)
    localStorage.setItem(CLAVE_DEUDA_MUSCULAR, JSON.stringify(deudas))
  }
}

export function saldarDeudaMuscular(grupoMuscular) {
  const deudas = obtenerDeudasMusculares().filter(g => g !== grupoMuscular)
  localStorage.setItem(CLAVE_DEUDA_MUSCULAR, JSON.stringify(deudas))
}

export function obtenerDeudasMusculares() {
  const raw = localStorage.getItem(CLAVE_DEUDA_MUSCULAR)
  try { return raw ? JSON.parse(raw) : [] } catch { return [] }
}
