# Guía para agentes

Lee **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** antes de cambiar nada. Explica las funcionalidades, la estructura, los datos, las decisiones de UX y las particularidades de iOS y Android.

## Reglas

- **Sin diagnóstico médico.** No clasifiques ni colorees mediciones (normal, alta…). La validación solo detecta errores de tecleo.
- **Sin backend, cuentas ni base de datos remota**, salvo que el usuario lo pida expresamente.
- **Simplicidad:** no añadas pantallas, menús ni funcionalidades que no se hayan pedido. No añadas dependencias sin justificar por qué no basta con la plataforma.
- **La UI solo accede a los datos a través de `src/data/index.ts`** (`MeasurementRepository`, `settings`, `backup`). Nunca uses IndexedDB ni localStorage desde los componentes.
- **No rompas datos existentes:** los cambios de esquema de IndexedDB se hacen subiendo `DB_VERSION` y migrando en `upgrade()`. Los cambios del archivo de copia se hacen subiendo `version` y aceptando las anteriores.
- **Español de España, formato 24 h y tema claro.** Usa los formatos de `src/format.ts`.
- **Compartir archivos** (`shareOrDownloadFile`) se llama directamente desde el toque del usuario, sin `await` previos largos, porque iOS lo exige.
- **No pongas barras fijas abajo en pantallas con campos de texto:** el teclado las desplaza y tapan los inputs.
- **Estilo del código:** sigue el del código existente, con comentarios en español, breves y solo donde aportan el porqué.

## Antes de dar un cambio por terminado

```bash
npm run lint
npm run build
npm run preview   # http://localhost:4173/blood-pressure/ para probar en el navegador con viewport móvil
```

Un push a `main` despliega automáticamente en https://jtorrast.github.io/blood-pressure/.
