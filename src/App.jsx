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
} from './services/storage'
import { guardarEntrenamiento, actualizarRachaServidor } from './services/api'

function App() {
  const [pantalla, setPantalla] = useState('seleccion')
  const [rutinaActiva, setRutinaActiva] = useState(null)
  const [estadoInicialEntrenamiento, setEstadoInicialEntrenamiento] = useState(null)
  const [sesionPausada, setSesionPausada] = useState(null)
  const [estadoCicloRutinas, setEstadoCicloRutinas] = useState({ nextRutinaId: 1, completadasHoy: [] })

  useEffect(() => {
    const sesion = obtenerSesionActiva()
    if (sesion) setSesionPausada(sesion)
    setEstadoCicloRutinas(obtenerEstadoCicloRutinas())
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

  const handleFinalizar = async (seriesGuardadas) => {
    await actualizarRachaServidor()
    const resultado = await guardarEntrenamiento(rutinaActiva.id, seriesGuardadas)
    if (resultado.offline) {
      guardarLocal({ rutina_id: rutinaActiva.id, series: seriesGuardadas })
      alert('Sin conexion. Entrenamiento guardado localmente.')
    } else {
      limpiarLocal()
      alert('Entrenamiento guardado.')
    }
    const nuevoEstadoCiclo = marcarRutinaCompletada(rutinaActiva.id)
    setEstadoCicloRutinas(nuevoEstadoCiclo)
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
        />
      )}
      {pantalla === 'dashboard' && <Dashboard onVolver={() => setPantalla('seleccion')} />}
    </div>
  )
}

export default App
