# Tensión arterial

PWA muy sencilla para registrar mediciones de tensión arterial desde el móvil (iOS y Android).
Los datos se guardan solo en el dispositivo (IndexedDB). Sin backend ni cuentas.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
npm run preview  # sirve dist/ (para probar la PWA y el service worker)
```

## Estructura

```
src/
  domain/   modelo y validación de las mediciones
  data/     persistencia (interfaz MeasurementRepository + implementación IndexedDB)
  components/  interfaz (React)
  pdf/      generación del PDF
```

La app se publica en GitHub Pages bajo `/blood-pressure/` (ver `base` en `vite.config.ts`).
