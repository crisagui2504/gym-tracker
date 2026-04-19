import { useState } from 'react'
import SeleccionRutina from './pages/SeleccionRutina'
import Entrenamiento from './pages/Entrenamiento'
import Dashboard from './pages/Dashboard'
import { guardarLocal, limpiarLocal, actualizarRacha } from './services/storage'
import { guardarEntrenamiento } from './services/api'

function App() {
  const [pantalla, setPantalla] = useState('seleccion')
  const [rutinaActiva, setRutinaActiva] = useState(null)

  const handleSeleccionar = (rutina) => {
    setRutinaActiva(rutina)
    setPantalla('entrenamiento')
  }

  const handleFinalizar = async (seriesGuardadas) => {
    actualizarRacha()
    const resultado = await guardarEntrenamiento(rutinaActiva.id, seriesGuardadas)
    if (resultado.offline) {
      guardarLocal({ rutina_id: rutinaActiva.id, series: seriesGuardadas })
      alert('Sin conexión. Entrenamiento guardado localmente.')
    } else {
      limpiarLocal()
      alert('¡Entrenamiento guardado!')
    }
    setPantalla('seleccion')
    setRutinaActiva(null)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {pantalla === 'seleccion' && (
        <SeleccionRutina
          onSeleccionar={handleSeleccionar}
          onDashboard={() => setPantalla('dashboard')}
        />
      )}
      {pantalla === 'entrenamiento' && (
        <Entrenamiento
          rutina={rutinaActiva}
          onVolver={() => setPantalla('seleccion')}
          onFinalizar={handleFinalizar}
        />
      )}
      {pantalla === 'dashboard' && (
        <Dashboard onVolver={() => setPantalla('seleccion')} />
      )}
    </div>
  )
}

export default App