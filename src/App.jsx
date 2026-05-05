import { useEffect, useState } from 'react'
import SeleccionRutina from './pages/SeleccionRutina'
import Entrenamiento from './pages/Entrenamiento'
import Dashboard from './pages/Dashboard'
import {
  guardarLocal,
  limpiarLocal,
  guardarSesionActiva,
  obtenerSesionActiva,
  limpiarSesionActiva,
  obtenerEstadoCicloRutinas,
  marcarRutinaCompletada,
  registrarDeudaMuscular,
  saldarDeudaMuscular,
} from './services/storage'
import {
  getDatosUsuario,
  guardarEntrenamiento,
  actualizarRachaServidor,
  guardarRecord,
  guardarHistorialEjercicioServidor,
  guardarCicloRutinas,
} from './services/api'

function App() {
  const [pantalla, setPantalla] = useState('seleccion')
  const [rutinaActiva, setRutinaActiva] = useState(null)
  const [estadoInicialEntrenamiento, setEstadoInicialEntrenamiento] = useState(null)
  const [sesionPausada, setSesionPausada] = useState(null)
  const [estadoCicloRutinas, setEstadoCicloRutinas] = useState({ nextRutinaId: 1, completadasHoy: [] })
  const [recordsMap, setRecordsMap] = useState({})

  useEffect(() => {
    const sesion = obtenerSesionActiva()
    if (sesion) setSesionPausada(sesion)

    // Cargar datos sincronizados desde el servidor
    getDatosUsuario().then(data => {
      if (!data) return
      if (data.records) setRecordsMap(data.records)
      if (data.ciclo) setEstadoCicloRutinas(data.ciclo)
    })
  }, [])

  const handleSeleccionar = (rutina) => {
    const base = { rutina, unidad: 'kg', seriesGuardadas: {} }
    guardarSesionActiva(base)
    setRutinaActiva(rutina)
    setEstadoInicialEntrenamiento(base)
    setPantalla('entrenamiento')
    setSesionPausada(null)
  }

  const handleReanudar = () => {
    if (!sesionPausada) return
    setRutinaActiva(sesionPausada.rutina)
    setEstadoInicialEntrenamiento(sesionPausada)
    setPantalla('entrenamiento')
  }

  const handleDescartarSesion = () => {
    limpiarSesionActiva()
    setSesionPausada(null)
  }

  const handleFinalizar = async (seriesGuardadas, nuevosPRs = []) => {
    const gruposCompletados = new Set()
    Object.keys(seriesGuardadas).forEach(ejercicioId => {
      const ej = rutinaActiva.ejercicios?.find(e => e.ejercicio_id === parseInt(ejercicioId))
      if (ej) gruposCompletados.add(ej.grupo_muscular)
    })
    // Grupos que estaban en la rutina pero no se completaron
    rutinaActiva.ejercicios?.forEach(ej => {
      if (!gruposCompletados.has(ej.grupo_muscular)) {
        registrarDeudaMuscular(ej.grupo_muscular)
      } else {
        saldarDeudaMuscular(ej.grupo_muscular)
      }
    })
    await actualizarRachaServidor()

    // Guardar PRs en servidor
    for (const pr of nuevosPRs) {
      await guardarRecord(pr.ejercicioId, pr.nombre, pr.peso)
    }

    const resultado = await guardarEntrenamiento(rutinaActiva.id, seriesGuardadas)
    if (resultado.offline) {
      guardarLocal({ rutina_id: rutinaActiva.id, series: seriesGuardadas })
      alert('Sin conexion. Entrenamiento guardado localmente.')
    } else {
      limpiarLocal()
      alert('Entrenamiento guardado.')
    }

    const nuevoCiclo = {
      nextRutinaId: calcularSiguienteRutina(rutinaActiva.id),
      completadasHoy: [...(estadoCicloRutinas.completadasHoy || []), rutinaActiva.id],
      ultimaFecha: new Date().toISOString().split('T')[0],
      ultimaRutinaId: rutinaActiva.id,
    }
    setEstadoCicloRutinas(nuevoCiclo)
    await guardarCicloRutinas(nuevoCiclo)

    limpiarSesionActiva()
    setPantalla('seleccion')
    setRutinaActiva(null)
    setEstadoInicialEntrenamiento(null)
    setSesionPausada(null)
  }

  const handleEstadoEntrenamiento = (estado) => {
    if (!rutinaActiva) return
    guardarSesionActiva({
      rutina: rutinaActiva,
      unidad: estado.unidad,
      seriesGuardadas: estado.seriesGuardadas,
    })
  }

  const handleVolverDesdeEntrenamiento = () => {
    setPantalla('seleccion')
    setSesionPausada(obtenerSesionActiva())
  }

  return (
    <div className="app-shell">
      {pantalla === 'seleccion' && (
        <SeleccionRutina
          onSeleccionar={handleSeleccionar}
          onDashboard={() => setPantalla('dashboard')}
          sesionPausada={sesionPausada}
          onReanudar={handleReanudar}
          onDescartarSesion={handleDescartarSesion}
          estadoCicloRutinas={estadoCicloRutinas}
        />
      )}
      {pantalla === 'entrenamiento' && (
        <Entrenamiento
          rutina={rutinaActiva}
          onVolver={handleVolverDesdeEntrenamiento}
          onFinalizar={handleFinalizar}
          onEstadoChange={handleEstadoEntrenamiento}
          estadoInicial={estadoInicialEntrenamiento}
          recordsMapInicial={recordsMap}
        />
      )}
      {pantalla === 'dashboard' && <Dashboard onVolver={() => setPantalla('seleccion')} />}
    </div>
  )
}

function calcularSiguienteRutina(rutinaId) {
  const orden = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const idx = orden.indexOf(rutinaId)
  return orden[(idx + 1) % orden.length]
}

export default App
