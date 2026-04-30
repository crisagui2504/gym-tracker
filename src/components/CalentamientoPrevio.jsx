import { useState } from 'react'
import { obtenerRecords } from '../services/storage'

const CALENTAMIENTOS = {
  push: {
    movilidad: [
      {
        nombre: 'Rotaciones de hombro',
        descripcion: '10 repeticiones hacia adelante y 10 hacia atras en cada brazo',
        duracion: '40 seg',
        url: 'https://www.youtube.com/results?search_query=rotacion+de+hombro+calentamiento',
      },
      {
        nombre: 'Circulos de muneca',
        descripcion: '10 circulos en cada direccion con ambas munecas',
        duracion: '20 seg',
        url: 'https://www.youtube.com/results?search_query=circulos+muneca+movilidad',
      },
      {
        nombre: 'Apertura de pecho con brazos extendidos',
        descripcion: 'Abre y cierra los brazos a la altura del pecho. 10 repeticiones',
        duracion: '30 seg',
        url: 'https://www.youtube.com/results?search_query=apertura+pecho+calentamiento',
      },
    ],
    activacion: [
      {
        nombre: 'Press de banca con barra vacia',
        descripcion: '2 series de 15 repeticiones. Enfocate en la trayectoria y la retraccion escapular',
        series: '2 x 15',
        url: 'https://www.youtube.com/results?search_query=press+banca+tecnica+correcta',
      },
      {
        nombre: 'Press militar con barra vacia',
        descripcion: '1 serie de 12 repeticiones. Activa los deltoides antes del trabajo pesado',
        series: '1 x 12',
        url: 'https://www.youtube.com/results?search_query=press+militar+tecnica',
      },
    ],
  },
  pull: {
    movilidad: [
      {
        nombre: 'Rotacion toracica en el suelo',
        descripcion: 'Acostado de lado, rota el torso abriendo el brazo hacia atras. 8 repeticiones cada lado',
        duracion: '40 seg',
        url: 'https://www.youtube.com/results?search_query=rotacion+toracica+movilidad',
      },
      {
        nombre: 'Retraccion escapular',
        descripcion: 'Brazos extendidos al frente, junta los omoplatos con fuerza. 15 repeticiones',
        duracion: '30 seg',
        url: 'https://www.youtube.com/results?search_query=retraccion+escapular+ejercicio',
      },
      {
        nombre: 'Circulos de hombro',
        descripcion: 'Circulos amplios hacia adelante y hacia atras. 10 en cada direccion',
        duracion: '30 seg',
        url: 'https://www.youtube.com/results?search_query=circulos+hombro+calentamiento',
      },
    ],
    activacion: [
      {
        nombre: 'Jalon al pecho con peso ligero',
        descripcion: '2 series de 15 repeticiones con peso muy ligero. Activa los dorsales antes de cargar',
        series: '2 x 15',
        url: 'https://www.youtube.com/results?search_query=jalon+al+pecho+tecnica+correcta',
      },
      {
        nombre: 'Remo con barra vacia',
        descripcion: '1 serie de 12 repeticiones. Siente la conexion espalda-codo en cada repeticion',
        series: '1 x 12',
        url: 'https://www.youtube.com/results?search_query=remo+con+barra+tecnica',
      },
    ],
  },
  leg: {
    movilidad: [
      {
        nombre: 'Sentadilla profunda sin peso con pausa',
        descripcion: 'Baja lentamente hasta el fondo y manten 2 segundos. 10 repeticiones',
        duracion: '40 seg',
        url: 'https://www.youtube.com/results?search_query=sentadilla+profunda+movilidad+cadera',
      },
      {
        nombre: 'Apertura de cadera (mariposa)',
        descripcion: 'Sentado en el suelo, junta las plantas de los pies y empuja las rodillas hacia abajo suavemente',
        duracion: '30 seg',
        url: 'https://www.youtube.com/results?search_query=apertura+cadera+mariposa+estiramiento',
      },
      {
        nombre: 'Estocada con rotacion de torso',
        descripcion: 'Da un paso al frente y rota el torso hacia la pierna de adelante. 8 repeticiones cada lado',
        duracion: '40 seg',
        url: 'https://www.youtube.com/results?search_query=estocada+rotacion+torso+movilidad',
      },
    ],
    activacion: [
      {
        nombre: 'Sentadilla con barra vacia',
        descripcion: '2 series de 15 repeticiones. Baja hasta paralelo, rodillas siguiendo los pies',
        series: '2 x 15',
        url: 'https://www.youtube.com/results?search_query=sentadilla+con+barra+tecnica+correcta',
      },
      {
        nombre: 'Buenos dias con barra vacia',
        descripcion: '1 serie de 10 repeticiones. Activa isquiotibiales y protege la espalda baja',
        series: '1 x 10',
        url: 'https://www.youtube.com/results?search_query=buenos+dias+ejercicio+tecnica',
      },
    ],
  },
}

function redondear(valor, paso = 2.5) {
  return Math.max(paso, Math.round(valor / paso) * paso)
}

function generarSeriesEspecificas(prKg) {
  if (!prKg || prKg < 10) return []
  return [
    { porcentaje: 0.5, reps: 10, label: '50%' },
    { porcentaje: 0.7, reps: 5, label: '70%' },
    { porcentaje: 0.9, reps: 1, label: '90%' },
  ].map((serie) => ({
    ...serie,
    peso: redondear(prKg * serie.porcentaje),
  }))
}

function ItemCalentamiento({ item, tipo, hecho, onToggle }) {
  const esActivacion = tipo === 'activacion'

  return (
    <div
      className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-opacity ${
        hecho
          ? 'border-[#bdd9c1] bg-[#ebf6ea] opacity-60'
          : 'border-[var(--surface-container-highest)] bg-[var(--surface)]'
      }`}
      onClick={onToggle}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          hecho
            ? 'bg-[#d7ebda] text-[#2e5e35]'
            : esActivacion
              ? 'bg-[#cee7f0] text-[#2f454d]'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'
        }`}
      >
        {hecho ? 'OK' : esActivacion ? 'ACT' : 'MOV'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{item.nombre}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-2 py-1 text-[10px] font-semibold text-[var(--primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            Ver
          </a>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)]">
          {item.descripcion}
        </p>
        <span
          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            esActivacion
              ? 'bg-[#e8f2f6] text-[#344a52]'
              : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)]'
          }`}
        >
          {esActivacion ? item.series : item.duracion}
        </span>
      </div>
    </div>
  )
}

function SeriesEspecificas({ ejercicio, pr }) {
  const series = generarSeriesEspecificas(pr)
  if (!series.length) return null

  return (
    <div className="mb-3 rounded-xl border border-[#e6cfab] bg-[#fff4e5] p-3">
      <p className="section-label mb-1 text-[#7a5a33]">
        Series de activacion - {ejercicio.nombre}
      </p>
      <p className="mb-2 text-xs text-[#9a7040]">
        Tu PR: <strong>{pr} kg</strong>. Haz estas series antes de cargar peso real:
      </p>
      <div className="flex flex-wrap gap-2">
        {series.map((serie, i) => (
          <div
            key={`${serie.label}-${i}`}
            className="rounded-xl border border-[#e8ceb1] bg-[#ffead2] px-3 py-2 text-center"
          >
            <p className="text-[10px] font-semibold text-[#7a5a33]">
              Serie {i + 1} - {serie.label}
            </p>
            <p className="text-base font-bold text-[#5a3e1b]">
              {serie.peso} kg
            </p>
            <p className="text-xs text-[#7a5a33]">
              x {serie.reps} rep{serie.reps > 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalentamientoPrevio({ tipo, ejercicios = [] }) {
  const [abierto, setAbierto] = useState(false)
  const [completados, setCompletados] = useState(new Set())
  const records = obtenerRecords()

  const calentamiento = CALENTAMIENTOS[tipo]
  if (!calentamiento) return null

  const totalItems = calentamiento.movilidad.length + calentamiento.activacion.length
  const totalCompletados = completados.size
  const porcentaje = totalItems > 0 ? (totalCompletados / totalItems) * 100 : 0

  const toggleCompletado = (key) => {
    setCompletados((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(key)) nuevo.delete(key)
      else nuevo.add(key)
      return nuevo
    })
  }

  const ejerciciosConPR = ejercicios
    .slice(0, 2)
    .filter((ejercicio) => records[ejercicio.ejercicio_id]?.peso)

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-[var(--outline-variant)]">
      <button
        onClick={() => setAbierto((p) => !p)}
        className="flex w-full items-center justify-between bg-[var(--surface-container)] px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary-fixed)] text-xs font-bold text-[var(--lane-push-text)]">
            WU
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--on-surface)]">Calentamiento previo</p>
            <p className="text-xs text-[var(--on-surface-variant)]">
              {totalCompletados === totalItems && totalItems > 0
                ? 'Listo para entrenar'
                : `${totalCompletados}/${totalItems} pasos - 5-8 min`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-[var(--surface-container-highest)]">
            <div
              className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className="text-sm text-[var(--on-surface-variant)]">
            {abierto ? 'Arriba' : 'Abajo'}
          </span>
        </div>
      </button>

      {abierto && (
        <div className="bg-[var(--surface)] px-4 pb-4 pt-3">
          <div className="mb-4">
            <p className="section-label mb-2">Movilidad articular</p>
            <div className="flex flex-col gap-2">
              {calentamiento.movilidad.map((item, i) => {
                const key = `mov-${i}`
                return (
                  <ItemCalentamiento
                    key={key}
                    item={item}
                    tipo="movilidad"
                    hecho={completados.has(key)}
                    onToggle={() => toggleCompletado(key)}
                  />
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="section-label mb-2">Activacion con barra vacia</p>
            <div className="flex flex-col gap-2">
              {calentamiento.activacion.map((item, i) => {
                const key = `act-${i}`
                return (
                  <ItemCalentamiento
                    key={key}
                    item={item}
                    tipo="activacion"
                    hecho={completados.has(key)}
                    onToggle={() => toggleCompletado(key)}
                  />
                )
              })}
            </div>
          </div>

          {ejerciciosConPR.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="section-label">Series de activacion especificas</p>
              <p className="-mt-2 text-xs text-[var(--on-surface-variant)]">
                Basadas en tus records personales. Hazlas despues de la barra vacia.
              </p>
              {ejerciciosConPR.map((ejercicio) => (
                <SeriesEspecificas
                  key={ejercicio.ejercicio_id}
                  ejercicio={ejercicio}
                  pr={records[ejercicio.ejercicio_id].peso}
                />
              ))}
            </div>
          )}

          {totalCompletados === totalItems && totalItems > 0 && (
            <div className="mt-3 rounded-xl border border-[#bdd9c1] bg-[#ebf6ea] px-3 py-2.5 text-center">
              <p className="text-sm font-semibold text-[#2c5c32]">
                Calentamiento completo. A entrenar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
