import { useMemo, useState } from 'react'
import { ejecutarMigracionWger, resumirMigracionWger, WGER_EXERCISE_MAP } from '../services/migrarHistorialWger'

const MAPA_INICIAL = JSON.stringify(WGER_EXERCISE_MAP, null, 2)

export default function BotonMigracionWger() {
  const [token, setToken] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [mapaTexto, setMapaTexto] = useState(MAPA_INICIAL)
  const [estado, setEstado] = useState('listo')
  const [mensaje, setMensaje] = useState('')
  const [progreso, setProgreso] = useState(null)
  const mapaParseado = useMemo(() => {
    try {
      const parsed = JSON.parse(mapaTexto)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return null
    }
  }, [mapaTexto])
  const resumen = useMemo(() => resumirMigracionWger(mapaParseado || {}), [mapaParseado])

  const ejecutar = async () => {
    setEstado('ejecutando')
    setMensaje(dryRun ? 'Simulando migracion...' : 'Enviando registros a WGER...')
    setProgreso(null)

    try {
      const resultado = await ejecutarMigracionWger({
        token,
        dryRun,
        exerciseMap: mapaParseado || {},
        onProgress: (info) => setProgreso(info),
      })
      setEstado('listo')
      setMensaje(
        dryRun
          ? `Simulacion lista: ${resultado.enviados} registros preparados, ${resultado.omitidos} omitidos por falta de mapeo.`
          : `Migracion lista: ${resultado.enviados} enviados, ${resultado.fallidos} fallidos, ${resultado.omitidos} omitidos.`
      )
      if (resultado.errores.length) console.warn('Errores de migracion WGER:', resultado.errores)
    } catch (error) {
      setEstado('error')
      setMensaje(error.message)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[#f0c0b7] bg-[#fff4f1] p-4 text-left">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#743126]">Migracion temporal a WGER</p>
          <p className="mt-1 text-xs text-[#925448]">
            No guardes tu token en codigo. Pegalo aqui solo al ejecutar.
          </p>
        </div>
        <span className="rounded-full bg-[#ffe2dc] px-2 py-1 text-[10px] font-bold text-[#743126]">
          DEV
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/70 p-2">
          <p className="text-lg font-bold">{resumen.total}</p>
          <p className="text-[10px] text-[#925448]">logs</p>
        </div>
        <div className="rounded-lg bg-white/70 p-2">
          <p className="text-lg font-bold">{resumen.mapeados}</p>
          <p className="text-[10px] text-[#925448]">mapeados</p>
        </div>
        <div className="rounded-lg bg-white/70 p-2">
          <p className="text-lg font-bold">{resumen.sinMapear}</p>
          <p className="text-[10px] text-[#925448]">sin mapear</p>
        </div>
      </div>

      <input
        value={token}
        onChange={(event) => setToken(event.target.value)}
        type="password"
        placeholder="Token de WGER"
        className="mb-2 w-full rounded-xl border border-[#e7c9c3] bg-white px-3 py-2 text-sm outline-none"
      />

      <textarea
        value={mapaTexto}
        onChange={(event) => setMapaTexto(event.target.value)}
        rows={4}
        spellCheck="false"
        className="mb-2 w-full rounded-xl border border-[#e7c9c3] bg-white px-3 py-2 font-mono text-xs outline-none"
        placeholder='{ "1": 192, "13": 111 }'
      />

      {mapaParseado === null && (
        <p className="mb-2 text-xs font-semibold text-[#a32018]">
          El mapa no es JSON valido. Ejemplo: {'{ "1": 192 }'}
        </p>
      )}

      <label className="mb-3 flex items-center gap-2 text-xs text-[#743126]">
        <input
          checked={dryRun}
          onChange={(event) => setDryRun(event.target.checked)}
          type="checkbox"
          className="h-4 w-4 rounded border-[#e7c9c3]"
        />
        Simular primero, sin enviar a WGER
      </label>

      <button
        type="button"
        disabled={estado === 'ejecutando' || mapaParseado === null || (!dryRun && !token.trim()) || resumen.mapeados === 0}
        onClick={ejecutar}
        className="w-full rounded-xl bg-[#743126] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        {estado === 'ejecutando' ? 'Migrando...' : dryRun ? 'Probar migracion' : 'Migrar a WGER'}
      </button>

      {progreso && (
        <p className="mt-2 text-xs text-[#925448]">
          {progreso.actual}/{progreso.total}: {progreso.log.nombre}
        </p>
      )}

      {mensaje && (
        <p className={`mt-2 text-xs ${estado === 'error' ? 'text-[#a32018]' : 'text-[#743126]'}`}>
          {mensaje}
        </p>
      )}

      {resumen.ejerciciosSinMapear.length > 0 && (
        <details className="mt-3 text-xs text-[#743126]">
          <summary className="cursor-pointer font-semibold">Ejercicios sin ID de WGER</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {resumen.ejerciciosSinMapear.slice(0, 8).map((item) => (
              <li key={item.ejercicioId}>
                {item.ejercicioId}: {item.nombre}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
