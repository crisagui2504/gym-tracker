# Gym Tracker — Documentación Completa

## Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Infraestructura y Despliegue](#infraestructura-y-despliegue)
4. [Base de Datos](#base-de-datos)
5. [Backend PHP (API)](#backend-php-api)
6. [Frontend React](#frontend-react)
7. [Servicios y Utilidades](#servicios-y-utilidades)
8. [Flujo de Datos](#flujo-de-datos)
9. [Guía de Actualización](#guía-de-actualización)
10. [Referencia Visual](#referencia-visual)

---

## Descripción General

**Gym Tracker** es una aplicación web progresiva (PWA) diseñada para el seguimiento personal de entrenamientos de gimnasio bajo una estructura de rutinas **Push / Pull / Piernas** dividida en 3 días por categoría (9 rutinas en total).

### ¿Qué hace?

- Permite seleccionar una rutina del día (Push, Pull o Pierna en sus variantes Día 1, 2 y 3)
- Muestra todos los ejercicios de esa rutina con sus series, repeticiones y tiempo de descanso objetivo
- Sugiere series de calentamiento progresivas basadas en el récord personal de cada ejercicio
- Permite registrar el peso y las repeticiones logradas en cada serie
- Botón de repetir serie anterior para agilizar el registro cuando el peso no varía
- Inicia un cronómetro de descanso automáticamente al completar cada serie con alerta de sonido
- Detecta y celebra nuevos récords personales (PRs) con animación de confeti
- Guarda un historial de entrenamientos en base de datos MySQL persistente en Azure
- Permite pausar un entrenamiento y reanudarlo después sin perder el progreso
- Mantiene una racha de días entrenados sincronizada entre todos los dispositivos vía MySQL
- Muestra un dashboard de progreso con récords personales y gráfica de evolución semanal real
- Permite ver una demostración visual de cada ejercicio y sustituirlo por una alternativa

### Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 8 |
| Estilos | Tailwind CSS v4 + CSS personalizado |
| Tipografías | Sora + IBM Plex Mono (Google Fonts) |
| Gráficas | Recharts |
| Confeti | canvas-confetti |
| Backend | PHP 8.3 |
| Base de datos | MySQL 8.0 |
| Servidor web | Apache 2.4 |
| Infraestructura | Azure VM (Ubuntu 24.04 LTS) |
| Control de versiones | GitHub |

---

## Arquitectura del Sistema

```
Usuario (celular/laptop)
        │
        │  HTTP (puerto 80)
        ▼
┌─────────────────────────────┐
│   Azure VM - crislaptop     │
│   IP: 20.172.67.68          │
│                             │
│  ┌─────────────────────┐   │
│  │  Apache 2.4          │   │
│  │  /var/www/html/      │   │
│  │  ├── index.html      │   │
│  │  ├── assets/         │   │
│  │  └── api/            │   │
│  │      ├── obtener_rutina_del_dia.php         │
│  │      ├── guardar_entrenamiento_completo.php │
│  │      ├── obtener_racha.php                  │
│  │      ├── actualizar_racha.php               │
│  │      └── obtener_estadisticas.php           │
│  └─────────────────────┘   │
│           │                 │
│  ┌─────────────────────┐   │
│  │  MySQL 8.0           │   │
│  │  Base: gym_bd        │   │
│  │  Usuario: gymuser    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Principio de diseño clave

La app sigue el patrón **"fetch único al inicio, procesamiento local después"**:

1. Al seleccionar una rutina → 1 petición HTTP al servidor → descarga todos los ejercicios
2. Durante el entrenamiento → todo ocurre en memoria del dispositivo (sin internet)
3. Al finalizar → 1 petición HTTP para guardar todo en MySQL de golpe

Esto protege el servidor de sobrecarga y permite usar la app sin señal en el gimnasio.

---

## Infraestructura y Despliegue

### Azure VM

| Campo | Valor |
|---|---|
| Nombre | crislaptop |
| Sistema operativo | Ubuntu 24.04 LTS |
| Tamaño | B2ts_v2 (2 vCPU, 1 GB RAM) |
| IP pública estática | 20.172.67.68 |
| IP privada | 10.1.0.4 |
| Usuario SSH | cris25 |
| URL de la app | http://20.172.67.68 |

### Reglas de red (NSG)

| Puerto | Protocolo | Propósito |
|---|---|---|
| 22 | TCP | SSH para administración |
| 80 | TCP | HTTP — sirve la app web |
| 443 | TCP | HTTPS (preparado para futuro) |
| 3000 | TCP | Puerto alternativo de desarrollo |

### Servicio systemd (inicio automático)

Archivo: `/etc/systemd/system/gym-tracker.service`

Este servicio garantiza que la app se reinicie automáticamente si el servidor se apaga o reinicia. Usa `npx serve` para servir el directorio `dist/` en el puerto 3000 (usado como respaldo).

Apache es el servidor principal en el puerto 80 y también inicia automáticamente con systemd.

### Comandos de administración de la VM

```bash
# Ver estado de Apache
sudo systemctl status apache2

# Reiniciar Apache
sudo systemctl restart apache2

# Ver estado de MySQL
sudo systemctl status mysql

# Ver logs de Apache en tiempo real
sudo tail -f /var/log/apache2/access.log

# Conectarse a MySQL
sudo mysql -u gymuser -p gym_bd
```

---

## Base de Datos

### Nombre: `gym_bd`
### Usuario: `gymuser`
### Host: `localhost`

### Diagrama de tablas

```
usuarios ──────────────────────────────────────────┐
id, nombre, unidad_peso,                           │
ultima_fecha_entrenamiento                         │
                                                   │
rutinas ──────────────────────────────┐            │
id, nombre_rutina, enfoque            │            │
        │                             │            │
        │                             │            │
rutina_ejercicios ◄───────────────────┘            │
id, rutina_id, ejercicio_id,                       │
orden, series_objetivo,                            │
reps_objetivo, descanso_segundos                   │
        │                                          │
        │                                          │
ejercicios ◄──────────────────────────────────────┐│
id, nombre, grupo_muscular, demo_url               ││
                                                   ││
historial_series ◄─────────────────────────────────┘┘
id, fecha, ejercicio_id, rutina_id,
numero_serie, peso_kg, repeticiones_logradas
```

### Descripción de cada tabla

#### `usuarios`
Guarda el perfil del atleta. Actualmente solo hay 1 usuario (id = 1).

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador único |
| nombre | VARCHAR(100) | Nombre del atleta |
| unidad_peso | VARCHAR(3) | 'kg' o 'lbs' |
| ultima_fecha_entrenamiento | DATE | Usada para calcular la racha sincronizada |

#### `ejercicios`
Catálogo general de todos los ejercicios disponibles (53 en total).

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador único |
| nombre | VARCHAR(150) | Nombre del ejercicio |
| grupo_muscular | VARCHAR(100) | Músculo principal trabajado |
| demo_url | VARCHAR(255) | URL de imagen/animación (opcional) |

#### `rutinas`
Define las 9 plantillas de entrenamiento.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador único |
| nombre_rutina | VARCHAR(100) | Ej: "Push Día 1" |
| enfoque | VARCHAR(200) | Descripción del objetivo del día |

Las 9 rutinas son:

| ID | Nombre | Enfoque |
|---|---|---|
| 1 | Push Día 1 | Fuerza base con barra y mancuernas |
| 2 | Pull Día 1 | Amplitud y grosor con pesos libres |
| 3 | Pierna Día 1 | Fuerza base con sentadilla libre |
| 4 | Push Día 2 | Hombros y pecho superior |
| 5 | Pull Día 2 | Grosor y agarre neutro/supino |
| 6 | Pierna Día 2 | Unilateral y variación de ángulos |
| 7 | Push Día 3 | Máquinas y aislamiento |
| 8 | Pull Día 3 | Máquinas y poleas |
| 9 | Pierna Día 3 | Máquinas y aislamiento puro |

#### `rutina_ejercicios`
Tabla de unión que conecta rutinas con ejercicios y define los parámetros de trabajo.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador único |
| rutina_id | INT FK | Referencia a rutinas |
| ejercicio_id | INT FK | Referencia a ejercicios |
| orden | INT | Posición en la rutina (1, 2, 3...) |
| series_objetivo | VARCHAR(10) | Ej: "4" o "2-5" |
| reps_objetivo | VARCHAR(10) | Ej: "6-8" o "10-15" |
| descanso_segundos | INT | Tiempo de descanso en segundos |

#### `historial_series`
Guarda cada serie individual que el atleta completa. Es la tabla más importante para el progreso y la gráfica de evolución.

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador único |
| fecha | DATE | Fecha del entrenamiento |
| ejercicio_id | INT FK | Qué ejercicio se hizo |
| rutina_id | INT FK | En qué rutina se hizo |
| numero_serie | INT | Número de serie (1, 2, 3, 4...) |
| peso_kg | DECIMAL(6,2) | Peso levantado en kg (siempre en kg) |
| repeticiones_logradas | INT | Repeticiones completadas |

---

## Backend PHP (API)

Todos los archivos PHP están en `/var/www/html/api/` en la VM.

### `obtener_rutina_del_dia.php`

**Método:** GET
**Parámetro:** `?rutina_id=N` (número del 1 al 9)
**URL de ejemplo:** `http://20.172.67.68/api/obtener_rutina_del_dia.php?rutina_id=1`

**Qué hace:** Recibe el ID de la rutina, hace un JOIN entre `rutina_ejercicios`, `ejercicios` y `rutinas`, y devuelve un JSON con todos los ejercicios del día.

**Respuesta de ejemplo:**
```json
{
  "rutina_id": 1,
  "ejercicios": [
    {
      "ejercicio_id": 1,
      "nombre": "Press de Banca con Barra",
      "grupo_muscular": "Pecho",
      "orden": 1,
      "series_objetivo": "4",
      "reps_objetivo": "6-8",
      "descanso_segundos": 180
    }
  ]
}
```

---

### `guardar_entrenamiento_completo.php`

**Método:** POST
**Body:** JSON con `rutina_id` y `series`

**Qué hace:** Recibe todos los datos del entrenamiento en un paquete, los inserta en `historial_series` dentro de una transacción MySQL (todo o nada), y actualiza `ultima_fecha_entrenamiento`.

**Body de ejemplo:**
```json
{
  "rutina_id": 1,
  "series": {
    "1": [
      { "numero_serie": 1, "peso_kg": 80, "repeticiones": 8 },
      { "numero_serie": 2, "peso_kg": 80, "repeticiones": 7 }
    ]
  }
}
```

---

### `obtener_racha.php`

**Método:** GET
**URL:** `http://20.172.67.68/api/obtener_racha.php`

**Qué hace:** Consulta `ultima_fecha_entrenamiento` y cuenta los días distintos entrenados en los últimos 60 días. Si el último fue hoy o ayer la racha está activa, si fue antes devuelve 0. Es el PHP que sincroniza la racha entre dispositivos.

**Respuesta de ejemplo:**
```json
{ "dias": 7, "ultimaFecha": "2026-04-20" }
```

---

### `actualizar_racha.php`

**Método:** POST

**Qué hace:** Actualiza `ultima_fecha_entrenamiento` a hoy en MySQL. Se llama automáticamente desde `App.jsx` al finalizar cada entrenamiento.

---

### `obtener_estadisticas.php`

**Método:** GET
**Parámetro:** `?ejercicio_id=N`
**URL de ejemplo:** `http://20.172.67.68/api/obtener_estadisticas.php?ejercicio_id=1`

**Qué hace:** Devuelve el mejor peso por día de los últimos 90 días para un ejercicio. Alimenta la gráfica de evolución semanal en el Dashboard.

**Respuesta de ejemplo:**
```json
{
  "ejercicio_id": 1,
  "historial": [
    { "fecha": "2026-04-20", "peso_kg": "36.00" },
    { "fecha": "2026-04-23", "peso_kg": "37.50" }
  ]
}
```

---

## Frontend React

### Estructura de carpetas

```
src/
├── components/
│   ├── ConfettiPR.jsx       — Modal de récord personal con confeti
│   └── ModalEjercicio.jsx   — Modal de demostración y alternativas
├── pages/
│   ├── SeleccionRutina.jsx  — Pantalla principal de selección
│   ├── Entrenamiento.jsx    — Pantalla de entrenamiento activo
│   └── Dashboard.jsx        — Pantalla de progreso y récords
├── services/
│   ├── api.js               — Comunicación con el servidor PHP
│   ├── storage.js           — localStorage y utilidades locales
│   └── rutinasLocales.js    — Datos de ejercicios, imágenes y alternativas
├── App.jsx                  — Componente raíz, navegación y sesión pausada
├── main.jsx                 — Punto de entrada de React
└── index.css                — Tailwind + variables CSS + tipografías + animaciones
```

---

### `App.jsx`

Componente raíz que maneja la navegación entre pantallas usando un estado `pantalla` con tres valores: `'seleccion'`, `'entrenamiento'` y `'dashboard'`.

**Estado:**
- `pantalla` — pantalla activa actualmente
- `rutinaActiva` — objeto con los datos de la rutina seleccionada
- `estadoInicialEntrenamiento` — estado que se pasa a Entrenamiento al iniciar o reanudar
- `sesionPausada` — sesión guardada en localStorage al abrir la app

**Funciones clave:**

| Función | Descripción |
|---|---|
| `handleSeleccionar` | Inicia nueva rutina, guarda sesión activa en localStorage |
| `handleReanudar` | Restaura sesión pausada con su estado previo |
| `handleDescartarSesion` | Limpia la sesión pausada de localStorage |
| `handleFinalizar` | Actualiza racha, guarda en MySQL, limpia sesión |
| `handleEstadoEntrenamiento` | Persiste el estado del entrenamiento en localStorage en cada cambio |
| `handleVolverDesdeEntrenamiento` | Vuelve a selección sin perder la sesión |

---

### `index.css`

Archivo de estilos global que define el sistema de diseño completo.

**Variables CSS:**

| Variable | Valor | Uso |
|---|---|---|
| `--bg-0` | `#071223` | Fondo base más oscuro |
| `--bg-1` | `#0e1e36` | Fondo base más claro |
| `--panel` | `rgba(10,22,40,0.82)` | Tarjetas con glassmorphism |
| `--panel-strong` | `rgba(6,16,30,0.92)` | Tarjetas más opacas |
| `--line` | `rgba(123,162,255,0.2)` | Bordes sutiles |
| `--text-main` | `#ecf2ff` | Texto principal |
| `--text-soft` | `#9caecd` | Texto secundario |
| `--text-faint` | `#7183a3` | Texto terciario/hints |
| `--mint` | `#37e2b7` | Acento verde-cyan |
| `--sun` | `#ffc76f` | Racha y calentamiento |
| `--danger` | `#ff6c7c` | Alerta y peligro |

**Clases utilitarias:**

| Clase | Descripción |
|---|---|
| `.panel` | Tarjeta glassmorphism con blur y borde sutil |
| `.panel-strong` | Tarjeta más opaca para contenido anidado |
| `.section-label` | Etiqueta uppercase con tracking |
| `.chip` | Pill para parámetros de ejercicios |
| `.btn-primary` | Botón verde-cyan para acciones principales |
| `.btn-secondary` | Botón azul oscuro para acciones secundarias |
| `.field-input` | Input transparente para peso y reps |
| `.mono` | Fuente IBM Plex Mono para números |

**Efectos visuales:**
- Fondo con gradientes radiales azul y cyan que crean profundidad
- `.app-shell::before` y `::after` — esferas de luz animadas en las esquinas con animación `drift`
- `safe-area-inset` — respeta notches y barras de navegación en iOS

---

### `pages/SeleccionRutina.jsx`

**Visualización:** Panel glassmorphism con título, fecha, racha en ámbar, y grilla de tarjetas con gradientes por tipo.

**Funcionalidades:**
- Racha sincronizada desde MySQL vía `getRachaServidor()`
- Banner de sesión pausada con botones Reanudar / Descartar
- Grilla 2 columnas en móvil, 3 columnas en desktop
- Tip motivacional en la parte inferior

**Props:**

| Prop | Descripción |
|---|---|
| `onSeleccionar` | Callback al elegir una rutina |
| `onDashboard` | Callback para ir al dashboard |
| `sesionPausada` | Objeto de sesión pausada o null |
| `onReanudar` | Callback para reanudar sesión pausada |
| `onDescartarSesion` | Callback para descartar sesión pausada |

---

### `pages/Entrenamiento.jsx`

La pantalla más compleja. Contiene 4 sub-componentes internos:

#### `Cronometro`
Usa `Date.now()` en lugar de decrementar un contador para garantizar exactitud aunque la pantalla se bloquee. Al llegar a 0 emite sonido con Web Audio API. La barra cambia de color: mint → sun → danger.

#### `FilaSerie`
Fila de serie individual con:
- Número de serie (círculo → "OK" verde al completar)
- Input de peso y reps
- Botón **REP** azul (desde serie 2, precarga datos de la serie anterior)
- Botón **OK** verde (confirma y arranca cronómetro)

#### `generarCalentamiento(prKg)` — función utilitaria
Calcula series de calentamiento basadas en el PR. Es matemática pura, no consulta la base de datos.

```
PR < 30 kg  → 2 series: 50% × 10, 70% × 6
PR ≥ 30 kg  → 3 series: 50% × 10, 75% × 5, 87.5% × 3
```

Los pesos se redondean al múltiplo de 2.5 kg más cercano. Las sugerencias aparecen solo antes de la primera serie y desaparecen al iniciar.

#### `TarjetaEjercicio`
Agrupa todas las series de un ejercicio. Recibe `recordsMap` con todos los PRs para calcular el calentamiento. Maneja la sustitución de ejercicio via modal.

#### Componente principal `Entrenamiento`

**Props nuevos respecto a versión anterior:**

| Prop | Descripción |
|---|---|
| `estadoInicial` | Estado previo al reanudar una sesión pausada |
| `onEstadoChange` | Persiste el estado en localStorage en cada cambio |

**Botón Finalizar:** Sticky en la parte inferior con gradiente de fondo, siempre visible.

---

### `pages/Dashboard.jsx`

**Visualización:** Panel glassmorphism con grilla de récords personales y gráfica de evolución semanal.

**Lógica de la gráfica:**
1. Intenta obtener historial real desde `getEstadisticas()` (MySQL vía PHP)
2. Si falla, cae al historial local en localStorage
3. Agrupa datos por semana ISO (lunes a domingo) tomando el mayor peso de cada semana
4. Muestra puntos reales en lugar de placeholders

**Funciones internas:**

| Función | Descripción |
|---|---|
| `extraerHistorialApi(payload)` | Normaliza la respuesta del PHP a formato estándar |
| `obtenerSemanaISO(fechaRaw)` | Calcula número de semana ISO de una fecha |
| `agruparSemanal(historial)` | Agrupa puntos por semana con el mayor peso de cada una |

---

### `components/ConfettiPR.jsx`

Modal de pantalla completa con confeti al detectar un nuevo récord. Muestra trofeo 🏆, nombre del ejercicio y peso logrado.

---

### `components/ModalEjercicio.jsx`

Panel inferior deslizable con imagen del ejercicio desde `wger.de` y lista de alternativas. Al tocar "Usar →" el ejercicio se sustituye solo para ese entrenamiento.

---

## Servicios y Utilidades

### `services/api.js`

| Función | Descripción |
|---|---|
| `getRutina(rutinaId)` | GET — ejercicios de una rutina desde MySQL |
| `guardarEntrenamiento(rutinaId, series)` | POST — guarda entrenamiento completo en MySQL |
| `getRachaServidor()` | GET — racha sincronizada desde MySQL |
| `actualizarRachaServidor()` | POST — actualiza fecha del último entrenamiento |
| `getEstadisticas(ejercicioId)` | GET — historial de pesos para la gráfica |

**Variable `USAR_DATOS_LOCALES`:** Cuando es `true` usa `rutinasLocales.js` en lugar del servidor. Para desarrollo local sin conexión.

---

### `services/storage.js`

Maneja el `localStorage`. Ampliado con soporte para sesiones pausadas e historial local.

| Función | Descripción |
|---|---|
| `guardarLocal(datos)` | Guarda entrenamiento pendiente offline |
| `obtenerLocal()` | Recupera entrenamiento pendiente |
| `limpiarLocal()` | Elimina entrenamiento pendiente |
| `guardarSesionActiva(sesion)` | Persiste estado del entrenamiento con timestamp |
| `obtenerSesionActiva()` | Recupera sesión pausada con validación |
| `limpiarSesionActiva()` | Elimina sesión activa al finalizar |
| `guardarRecords(records)` | Guarda todos los PRs |
| `obtenerRecords()` | Recupera todos los PRs |
| `actualizarRecord(id, nombre, peso)` | Actualiza un PR si el nuevo peso es mayor |
| `esNuevoRecord(id, peso)` | Devuelve `true` si el peso supera el PR actual |
| `guardarRegistroHistorial(datos)` | Guarda cada serie en historial local por ejercicio |
| `obtenerHistorialTodos()` | Devuelve historial completo de todos los ejercicios |
| `obtenerHistorialEjercicio(id)` | Devuelve historial de un ejercicio específico |
| `convertirAKg(valor, unidad)` | Convierte lbs a kg |
| `convertirDesdeKg(valor, unidad)` | Convierte kg a lbs |

**Claves de localStorage:**

| Clave | Contenido |
|---|---|
| `gym_entrenamiento_pendiente` | Entrenamiento sin sincronizar (modo offline) |
| `gym_records_personales` | PRs por ejercicio_id |
| `gym_sesion_activa` | Estado del entrenamiento actual con timestamp |
| `gym_historial_ejercicios` | Historial local de series por ejercicio_id |
| `gym_racha` | Racha local de respaldo |

---

### `services/rutinasLocales.js`

| Exportación | Contenido |
|---|---|
| `RUTINAS_LOCALES` | 9 rutinas completas para modo sin servidor |
| `IMAGENES_EJERCICIOS` | Mapa `ejercicio_id → URL` de imágenes en wger.de |
| `ALTERNATIVAS_EJERCICIOS` | Mapa `ejercicio_id → [ids de alternativas]` |
| `TODOS_EJERCICIOS` | Catálogo de 53 ejercicios en formato `{id: datos}` |

---

## Flujo de Datos

### Flujo de un entrenamiento completo

```
1. Usuario abre http://20.172.67.68
   └─► getRachaServidor() → MySQL → muestra días de racha
   └─► obtenerSesionActiva() → si hay sesión, muestra banner de reanudación

2. Usuario toca "Push Día 1"
   └─► guardarSesionActiva() → localStorage
       └─► getRutina(1) → PHP → MySQL → 6 ejercicios en estado local
           └─► obtenerRecords() → calcula calentamiento por ejercicio

3. Usuario ve sugerencias de calentamiento (ej: 40kg×10, 60kg×5, 70kg×3)
   └─► Las registra manualmente (no se guardan en BD)

4. Usuario completa Series → Cronómetro → Botón REP en serie siguiente

5. Al completar todas las series de un ejercicio
   └─► guardarRegistroHistorial() → localStorage
       └─► esNuevoRecord() → true → actualizarRecord() → ConfettiPR

6. Usuario toca "Finalizar entrenamiento"
   └─► actualizarRachaServidor() → PHP → MySQL
       └─► guardarEntrenamiento() → PHP → MySQL (transacción)
           └─► limpiarSesionActiva() → vuelve a SeleccionRutina
```

### Flujo de sesión pausada

```
1. Usuario toca "Volver" durante el entrenamiento
   └─► sesión queda en localStorage con timestamp
       └─► SeleccionRutina muestra banner "Tienes una rutina en pausa"

2. Usuario toca "Reanudar"
   └─► restaura rutinaActiva y estadoInicial desde localStorage
       └─► series ya completadas aparecen como "OK"
```

### Flujo de la gráfica de progreso

```
1. Usuario selecciona un ejercicio en el Dashboard
   └─► getEstadisticas(id) → PHP → MySQL → historial de 90 días
       └─► Si responde: agrupa por semana ISO → gráfica real
       └─► Si falla: obtenerHistorialEjercicio() → localStorage → gráfica local
```

### Flujo modo offline

```
1. Usuario finaliza sin conexión
   └─► guardarEntrenamiento() falla → return { offline: true }
       └─► guardarLocal() → localStorage
           └─► Alert: "Sin conexión. Entrenamiento guardado localmente."
```

---

## Guía de Actualización

### Actualizar la app después de cambios

```bash
# En tu PC local
cd C:\Users\rodri\gym-tracker
git add .
git commit -m "tipo: descripcion del cambio"
git push

# En la VM Azure
cd ~/gym-tracker
git pull
npm run build
sudo cp -r dist/* /var/www/html/
```

### Convención de commits

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `refactor` | Cambio de código sin agregar funciones |
| `style` | Cambios de estilos visuales |
| `docs` | Cambios en documentación |
| `chore` | Mantenimiento y configuración |

### Agregar un ejercicio nuevo

```sql
sudo mysql -u gymuser -p gym_bd

INSERT INTO ejercicios (nombre, grupo_muscular)
VALUES ('Nombre del Ejercicio', 'Grupo Muscular');

SELECT LAST_INSERT_ID();

INSERT INTO rutina_ejercicios
(rutina_id, ejercicio_id, orden, series_objetivo, reps_objetivo, descanso_segundos)
VALUES (1, [ID], 7, '3', '10-12', 90);
```

### Backup de la base de datos

```bash
# Crear backup
mysqldump -u gymuser -p gym_bd > backup_gym_$(date +%Y%m%d).sql

# Restaurar
mysql -u gymuser -p gym_bd < backup_gym_20260420.sql
```

### Reiniciar servicios

```bash
sudo systemctl start apache2
sudo systemctl start mysql
```

---

## Referencia Visual

### Sistema de diseño

Estilo **dark glassmorphism** con fondo de gradiente radial azul/cyan y tarjetas semitransparentes con efecto blur.

**Tipografías:**
- **Sora** — texto principal, títulos y botones (pesos 400, 600, 700, 800)
- **IBM Plex Mono** — números de peso, reps, cronómetro y récords

### Paleta de colores

| Elemento | Variable / Hex |
|---|---|
| Fondo base oscuro | `--bg-0: #071223` |
| Fondo base claro | `--bg-1: #0e1e36` |
| Texto principal | `--text-main: #ecf2ff` |
| Texto secundario | `--text-soft: #9caecd` |
| Acento mint | `--mint: #37e2b7` |
| Racha / calentamiento | `--sun: #ffc76f` |
| Alerta | `--danger: #ff6c7c` |
| Push | `rose-500` |
| Pull | `sky-500` |
| Pierna | `emerald-500` |
| Completado | `emerald-400` |
| Repite serie | `sky-400` |

### Pantallas de la aplicación

**Pantalla 1 — Selección de Rutina**
- Header con título, fecha y racha en ámbar
- Banner verde de sesión pausada con botones Reanudar/Descartar
- Grilla 2×3 (móvil) / 3×3 (desktop) con tarjetas glassmorphism
- Botón "Ver mi progreso" secundario
- Tip motivacional al fondo

**Pantalla 2 — Entrenamiento Activo**
- Header sticky con blur: botón Volver, switch kg/lbs, nombre de rutina, barra de progreso
- Por cada ejercicio: nombre, pills, sugerencias de calentamiento en ámbar
- Filas de series: número → inputs → botón REP (azul) → botón OK (verde)
- Cronómetro con barra de color y cuenta regresiva en fuente mono
- Botón sticky "Finalizar entrenamiento" con gradiente

**Pantalla 3 — Dashboard**
- Contador de ejercicios con PR
- Grilla de tarjetas de récords (1 col móvil / 2 col desktop)
- Gráfica de líneas mint con agrupación semanal real desde MySQL
- Indicador de semanas registradas

**Modal — Ver / Alternativas**
- Panel inferior deslizable con imagen desde wger.de
- Lista de alternativas con botón "Usar →"

**Modal — Récord Personal**
- Overlay con confeti, trofeo 🏆 y peso del nuevo récord

---

## Repositorio

**GitHub:** https://github.com/crisagui2504/gym-tracker
**Rama principal:** `main`
**Acceso:** Privado

---

*Documentación actualizada el 22 de abril de 2026*
*Versión de la app: 1.1.0*