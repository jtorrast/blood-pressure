# Tensión arterial: documento de referencia

Documento de contexto para quien vaya a modificar la app (personas o agentes). Describe qué hace la app hoy, cómo está organizada, las decisiones tomadas y por qué.

- **App publicada:** https://jtorrast.github.io/blood-pressure/
- **Repositorio:** https://github.com/jtorrast/blood-pressure

## 1. Qué es y principios

PWA muy sencilla para registrar mediciones de tensión arterial desde el móvil durante unas semanas y entregar un PDF a un profesional sanitario. La usa una sola persona por dispositivo.

Principios que rigen cualquier cambio:

- **Simplicidad de uso ante todo.** Abrir, teclear tres números y guardar con el mínimo de toques. Nada de menús, pantallas o navegación innecesarias.
- **Mobile-first y con una sola mano.** Debe funcionar instalada en iPhone (Safari) y Android (Chrome).
- **Sin diagnóstico.** La app nunca clasifica ni colorea una medición (normal, alta, hipertensión…). La validación solo detecta errores de tecleo con rangos físicamente posibles.
- **Sin backend, sin cuentas, sin base de datos remota.** Los datos viven solo en el dispositivo y cada móvil tiene los suyos.
- **Pocas dependencias y código fácil de leer.** No sobrearquitecturar.
- **Español de España, formato 24 h y tema claro únicamente.**

## 2. Funcionalidades actuales

1. **Registrar una medición:** sistólica, diastólica, pulso y observaciones opcionales.
   - La fecha y la hora son automáticas ("Sábado 3 oct · 10:42"); con "Cambiar" se introducen a mano.
   - Los tres campos numéricos están en una fila, con teclado numérico y **avance automático** al siguiente campo (ver §6).
2. **Últimas mediciones:** las 3 más recientes en la pantalla principal (fecha `dd/mm/aaaa` y hora).
3. **Historial completo:** agrupado por día ("Viernes, 2 de octubre"), de la más reciente a la más antigua.
4. **Editar una medición:** al tocar una fila se abre un panel inferior con todos los campos, incluida la fecha.
5. **Eliminar una medición:** desde el panel de edición, con diálogo de confirmación.
6. **PDF para el médico:** desde el historial, botón "Generar PDF".
   - Nombre del paciente opcional, que se recuerda.
   - Tabla A4 en orden cronológico ascendente, con paginación.
   - Se comparte con el menú del sistema.
7. **Copia de seguridad:**
   - Cada 5 mediciones nuevas, un diálogo propone guardar una copia, con la casilla "No volver a preguntar".
   - En el historial: "Hacer copia ahora", "Restaurar copia" y la casilla "Preguntar cada 5 mediciones".
8. **PWA instalable y sin conexión**, con actualización automática.
9. **Botón atrás de Android:** cierra el panel de edición y las pantallas secundarias en lugar de salir de la app.

## 3. Stack

| Pieza | Uso |
| --- | --- |
| React 19 + TypeScript + Vite | App y build |
| CSS plano (`src/index.css`) | Estilos, con tokens de color en `:root` |
| `idb` | Envoltorio mínimo de IndexedDB con promesas |
| `jspdf` + `jspdf-autotable` | Generación del PDF en el cliente, cargados bajo demanda |
| `vite-plugin-pwa` (dev) | Manifest y service worker (Workbox, `generateSW`) |
| `oxlint` (dev) | Linter |

No hay librerías de fechas, estado global, enrutado ni UI. Para las fechas basta `Intl.DateTimeFormat`, para los identificadores `crypto.randomUUID()` y para el estado `useState` y un hook propio.

Antes de añadir una dependencia, justifica por qué no basta con la plataforma.

## 4. Estructura

```
src/
  main.tsx                  Punto de entrada; pide almacenamiento persistente
  App.tsx                   Pantallas, navegación, botón atrás, avisos (toast), copia y restauración
  useMeasurements.ts        Hook: carga, guarda, borra y restaura mediciones vía el repositorio
  format.ts                 Formatos de fecha y hora es-ES y conversión para <input type="date|time">
  shareFile.ts              Compartir un archivo con el menú del sistema, o descargarlo si no se puede

  domain/
    measurement.ts          Modelo BloodPressureMeasurement, validación, rangos y toMeasurement()

  data/                     Persistencia (la UI solo importa desde data/index.ts)
    MeasurementRepository.ts  Interfaz: list / get / save / delete
    indexedDbRepository.ts    Implementación con IndexedDB y requestPersistentStorage()
    settings.ts               Preferencias en localStorage (nombre del paciente, estado de las copias)
    backup.ts                 Formato del archivo de copia: crear y leer, con validación
    index.ts                  Punto único donde se elige la implementación

  pdf/
    exportPdf.ts            loadPdfGenerator() con import dinámico de jsPDF, y pdfFileName()

  components/
    NewMeasurementForm.tsx  Formulario principal con hora automática o manual
    MeasurementFields.tsx   Fila sistólica / diastólica / pulso con avance automático
    fieldValues.ts          Tipos y utilidades de los campos (valores como texto, parseo, limpiar errores)
    NotesField.tsx          Observaciones; al enfocarlo se desplaza para quedar sobre el teclado
    DateTimeInputs.tsx      Inputs nativos de fecha y hora
    MeasurementList.tsx     Filas de mediciones (con o sin fecha)
    HistoryScreen.tsx       Historial agrupado por día, botón PDF y sección de copia
    EditSheet.tsx           Panel inferior de edición y borrado
    ConfirmDialog.tsx       Diálogo de confirmación genérico
    PdfScreen.tsx           Nombre del paciente y botón Compartir PDF
    BackupDialog.tsx        Aviso cada 5 mediciones
    BackupSection.tsx       Sección "Copia de seguridad" del historial
    Toast.tsx               Aviso breve con animación CSS
    icons.tsx               Iconos SVG en línea

public/                     Iconos de la PWA (ver §9)
.github/workflows/deploy.yml  Build y despliegue en GitHub Pages
```

### Capas y dependencias

```
components/ ──► domain/      (tipos y validación)
     │
     └──► App.tsx / useMeasurements.ts ──► data/index.ts ──► indexedDbRepository / settings / backup
                                      └──► pdf/, shareFile.ts
```

- `domain/` no depende de nada. Es TypeScript puro.
- La UI no conoce IndexedDB: solo usa `MeasurementRepository`, a través de `measurementRepository` en `data/index.ts`. Para sustituir o complementar el almacenamiento (por ejemplo, una copia remota), se crea otra implementación de la interfaz y se cambia en `data/index.ts`.
- `useMeasurements` recarga la lista completa tras cada escritura. Con el volumen previsto (decenas o pocos cientos de registros) es lo más simple y suficiente.

## 5. Datos

### Modelo (`domain/measurement.ts`)

```ts
interface BloodPressureMeasurement {
  id: string          // crypto.randomUUID()
  measuredAt: Date
  systolic: number    // mmHg
  diastolic: number   // mmHg
  pulse: number       // ppm
  notes?: string      // se omite si está vacío
}
```

Los formularios trabajan con un `MeasurementDraft` en el que los campos vacíos son `null`. `validateMeasurement()` devuelve los errores por campo y `toMeasurement(draft, id?)` construye la medición: con `id` se conserva el de una medición existente, para editarla.

**Validación** (solo errores de tecleo, nunca diagnóstico):

- Sistólica entre 50 y 300, diastólica entre 30 y 200 y pulso entre 30 y 250 (`LIMITS`).
- La sistólica debe ser mayor que la diastólica.
- La fecha es obligatoria y no puede ser futura (tolerancia de 1 minuto).

### IndexedDB (`data/indexedDbRepository.ts`)

- **Base de datos:** `blood-pressure`, versión `1`. **Almacén:** `measurements` (`keyPath: 'id'`), con el índice `by-measuredAt`.
- **Fecha:** `measuredAt` se guarda como **timestamp numérico**, para ordenar por el índice y serializar sin ambigüedad. Se convierte a `Date` al leer.
- **Orden:** `list()` devuelve de la más reciente a la más antigua.
- **Cambios de esquema:** se sube `DB_VERSION` y la migración se gestiona en `upgrade()`, teniendo en cuenta `oldVersion`. No se pueden perder datos de los usuarios.

### localStorage (`data/settings.ts`)

Solo guarda preferencias que se pueden perder sin daño:

| Clave | Contenido |
| --- | --- |
| `bp.patientName` | Nombre del paciente para el PDF |
| `bp.lastBackupAt` | Fecha ISO de la última copia hecha |
| `bp.newSinceBackup` | Mediciones nuevas desde la última copia o el último aviso |
| `bp.backupReminderOff` | `'1'` si el usuario desactivó el aviso |

### Archivo de copia (`data/backup.ts`)

Es un JSON (`tension-copia-AAAA-MM-DD.json`):

```json
{
  "app": "blood-pressure",
  "version": 1,
  "exportedAt": "2026-10-03T10:00:00.000Z",
  "measurements": [
    { "id": "…", "measuredAt": "2026-10-02T06:15:00.000Z", "systolic": 120, "diastolic": 80, "pulse": 65, "notes": "…" }
  ]
}
```

- **Restaurar** solo **añade** las mediciones cuyo `id` no existe. Nunca sobrescribe ni borra.
- **Al leer** se valida cada medición, salvo la regla de fecha futura. Si algo falla, se lanza `InvalidBackupError` con un mensaje para el usuario.
- **Si cambia el modelo**, hay que subir `version` y seguir aceptando las copias antiguas.

## 6. Decisiones de UX que conviene no romper

- **Avance automático:** un campo se da por completo con 3 cifras, o con 2 si el valor es ≥ 30, porque un valor menor solo puede ser el inicio de un 100 o más. Tras el pulso se quita el foco y se cierra el teclado. Existe porque el teclado numérico de iOS no tiene tecla "Siguiente".
- **Campos vacíos al abrir:** no se rellenan con valores por defecto, para evitar guardar un valor por error.
- **Botón "Guardar medición" dentro del formulario, no fijo abajo:** con el teclado abierto, los elementos fijos tapaban los campos. Solo se usan barras fijas abajo (`.bottom-bar`) en pantallas sin campos de texto, como el historial.
- **Tamaño de letra de los inputs ≥ 16 px:** evita el zoom automático de iOS.
- **Teclado numérico:** `inputMode="numeric"` y `pattern="[0-9]*"`, con `type="text"` para controlar el valor.
- **Navegación sin router:** `App.tsx` guarda la pantalla actual (`main | history | pdf`) y si hay una medición en edición. Cada capa que se abre hace `history.pushState`, y cerrar con un botón llama a `history.back()`. El listener de `popstate` cierra la capa superior. Así funciona el botón atrás de Android.
- **El PDF va en orden ascendente** (así se lee la evolución); el historial va en orden descendente.
- **Sin vista previa del PDF en la app:** se probó y se retiró a petición del usuario. En iOS, el menú Compartir no enseña el PDF, pero se puede ver con "Guardar en Archivos".

## 7. PDF (`pdf/exportPdf.ts`)

- `loadPdfGenerator()` importa jsPDF y autotable **bajo demanda**. `PdfScreen` lo llama al abrirse.
- El generador que devuelve es **síncrono**. iOS solo abre el menú Compartir si `navigator.share()` se llama justo después del toque, sin esperas previas. Por eso el PDF se genera dentro del manejador del clic, con la librería ya cargada.
- **Contenido:**
  - título "Registro de tensión arterial";
  - "Paciente:", si hay nombre;
  - "Periodo: dd/mm/aaaa – dd/mm/aaaa · N mediciones";
  - "Generado el …";
  - una tabla con Fecha, Hora, Sistólica (mmHg), Diastólica (mmHg), Pulso (ppm) y Observaciones;
  - un pie con "Página X de Y".
- **Fuente:** Helvetica estándar, que cubre los acentos del español. Caracteres fuera de Latin-1, como los emoji en las observaciones, no se verían bien.

## 8. Compartir y descargar (`shareFile.ts`)

`shareOrDownloadFile(blob, fileName, title)` prueba primero `navigator.canShare({ files })` y `navigator.share`. Si no se puede, descarga el archivo con un enlace temporal. Devuelve `'shared' | 'downloaded' | 'cancelled'`.

Comportamiento por plataforma:

- **iOS:** comparte tanto el PDF como el JSON. Para guardar un archivo, se elige "Guardar en Archivos".
- **Android Chrome:** comparte PDF, pero **no permite compartir JSON**, así que la copia de seguridad se descarga en *Descargas*. Es el comportamiento buscado.
- **Gesto del usuario:** hay que llamarla siempre directamente desde un toque.

## 9. PWA y despliegue

- **`vite.config.ts`:**
  - `base: '/blood-pressure/'`, porque GitHub Pages sirve la app en esa ruta;
  - `registerType: 'autoUpdate'`;
  - manifest en español, `display: standalone`, `theme_color` y `background_color` `#eef2f5`.
- **Precaché:** Workbox precachea toda la app, jsPDF incluido, para que el PDF funcione sin conexión. Se excluyen los módulos opcionales de jsPDF que no se usan (`html2canvas`, `purify`, `index.es`, que es canvg).
- **Iconos:** en `public/`, generados a partir de `public/icon.svg` con `@vite-pwa/assets-generator` (no es dependencia del proyecto; se ejecutó con `npx`).
  - El **maskable** y el **apple-touch-icon** tienen fondo azul `#1d5b8f` de borde a borde. Si se regeneran, hay que mantenerlo, porque con fondo blanco Android muestra un cuadrado dentro de un círculo blanco.
  - Cambiar el icono **no se refleja en las apps ya instaladas** hasta reinstalarlas.
- **`index.html`:** metas de iOS (`apple-mobile-web-app-*`), `viewport-fit=cover` y `color-scheme: light`.
- **Despliegue:** `.github/workflows/deploy.yml` se ejecuta en cada push a `main`. Hace `npm ci`, `npm run lint` y `npm run build`, y despliega `dist/` en GitHub Pages.

## 10. Particularidades de las plataformas

- **iOS: datos separados.** Safari y la app instalada en la pantalla de inicio **no comparten datos**. Hay que usar siempre el icono.
- **iOS: borrar el icono** de la pantalla de inicio borra los datos de la app.
- **Android: borrar datos.** Desinstalar la app o borrar los datos de Chrome elimina las mediciones.
- **Persistencia:** `navigator.storage.persist()` se pide al arrancar. Reduce el riesgo de que el sistema borre los datos, pero no protege del borrado por parte del usuario. Para eso existen las copias de seguridad.
- **Actualizaciones:** el service worker actualiza la app al abrirla con conexión. Si una sesión abierta con la versión anterior intenta cargar un módulo que ya no existe (por ejemplo, el de jsPDF tras un despliegue), puede fallar hasta cerrar y abrir la app.

## 11. Desarrollo y verificación

```bash
npm install
npm run dev       # desarrollo
npm run lint      # oxlint
npm run build     # tsc -b + vite build (incluye la PWA)
npm run preview   # sirve dist/ en http://localhost:4173/blood-pressure/ (necesario para probar el service worker)
```

- **Sin tests automatizados en el repo.** Hasta ahora, los cambios se han verificado con scripts puntuales de Playwright (`playwright-core` usando el Chrome instalado) contra `npm run preview`, con un viewport de móvil.
  - Se han cubierto el alta y el avance automático, la persistencia tras recargar, la edición y el borrado, el botón atrás, el PDF con el menú Compartir simulado, el uso sin conexión, y la copia y la restauración.
  - Al tocar el dominio o la persistencia, conviene repetir algo similar.
- **Pruebas en móviles reales:** lo que depende de la plataforma (teclado, menú Compartir, instalación, descargas) solo se puede confirmar en un iPhone y un Android reales.

## 12. Cómo extender

- **Nuevo campo en la medición:**
  1. `domain/measurement.ts`: tipo, draft y validación.
  2. Formularios: `NewMeasurementForm`, `EditSheet` y, si es numérico, `MeasurementFields`.
  3. `MeasurementList`.
  4. PDF: columnas en `exportPdf.ts`.
  5. Copia: `backup.ts`, subiendo `version` y aceptando la versión anterior.
  6. IndexedDB: subir `DB_VERSION` si hace falta un índice.
- **Almacenamiento remoto o sincronización:**
  - Implementar `MeasurementRepository`, o un decorador que escriba en local y remoto, y cambiarlo en `data/index.ts`.
  - Si se guardan datos de salud fuera del dispositivo, cifrarlos en el cliente.
  - Se valoró una copia automática cifrada en Firebase con código de recuperación y se descartó por simplicidad.
- **Nueva pantalla:** añadir el valor a `screen` en `App.tsx`, abrirla con `openScreen()` (que hace `pushState`) y gestionarla en el listener de `popstate`.
- **Textos:** todos están en español y escritos en los propios componentes. No hay sistema de i18n, porque no se necesita.

## 13. Descartado o pendiente

- **Descartado:**
  - sincronización entre dispositivos;
  - autenticación y backend;
  - clasificación médica de las mediciones;
  - modo oscuro;
  - filtro por fechas en el PDF;
  - aviso de "Añadir a pantalla de inicio" (la instalación la hace una persona a mano);
  - vista previa del PDF en la app;
  - copia automática en la nube.
- **Pendiente de confirmar en dispositivo real:** que el campo Observaciones quede siempre visible sobre el teclado en iOS y Android.
