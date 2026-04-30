import { useState } from 'react'

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

function ItemCalentamiento({ item, tipo }) {
  const esActivacion = tipo === 'activacion'

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--surface-container-highest)] bg-[var(--surface)] p-3">
      <div
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          esActivacion
            ? 'bg-[#cee7f0] text-[#2f454d]'
            : 'bg-[var(--tertiary-fixed)] text-[var(--on-surface-variant)]'
        }`}
      >
        {esActivacion ? 'ACT' : 'MOV'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{item.nombre}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-2 py-1 text-[10px] font-semibold text-[var(--primary)] active:scale-95"
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

export default function CalentamientoPrevio({ tipo }) {
  const [abierto, setAbierto] = useState(false)
  const [completados, setCompletados] = useState(new Set())

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
                : `${totalCompletados}/${totalItems} completados - 5-8 min`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <div className="h-1.5 w-16 rounded-full bg-[var(--surface-container-highest)]">
              <div
                className="h-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          )}
          <span className="text-sm text-[var(--on-surface-variant)]">
            {abierto ? 'Arriba' : 'Abajo'}
          </span>
        </div>
      </button>

      {abierto && (
        <div className="bg-[var(--surface)] px-4 pb-4 pt-3">
          <div className="mb-3">
            <p className="section-label mb-2">Movilidad articular</p>
            <div className="flex flex-col gap-2">
              {calentamiento.movilidad.map((item, i) => {
                const key = `mov-${i}`
                const hecho = completados.has(key)
                return (
                  <div
                    key={key}
                    className={`transition-opacity ${hecho ? 'opacity-50' : ''}`}
                    onClick={() => toggleCompletado(key)}
                  >
                    <div className="relative">
                      <ItemCalentamiento item={item} tipo="movilidad" />
                      {hecho && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d7ebda] text-[10px] font-bold text-[#2e5e35]">
                          OK
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Activacion con barra vacia</p>
            <div className="flex flex-col gap-2">
              {calentamiento.activacion.map((item, i) => {
                const key = `act-${i}`
                const hecho = completados.has(key)
                return (
                  <div
                    key={key}
                    className={`transition-opacity ${hecho ? 'opacity-50' : ''}`}
                    onClick={() => toggleCompletado(key)}
                  >
                    <div className="relative">
                      <ItemCalentamiento item={item} tipo="activacion" />
                      {hecho && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d7ebda] text-[10px] font-bold text-[#2e5e35]">
                          OK
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {totalCompletados === totalItems && totalItems > 0 && (
            <div className="mt-3 rounded-xl border border-[#bdd9c1] bg-[#ebf6ea] px-3 py-2.5 text-center">
              <p className="text-sm font-semibold text-[#2c5c32]">
                Calentamiento completado. A entrenar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
