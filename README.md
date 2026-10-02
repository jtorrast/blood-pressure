# Tensión arterial

A very simple PWA to log blood pressure readings from a phone (iOS and Android) and generate a PDF for the doctor.
Data is stored only on the device (IndexedDB). There is no backend and no accounts.

The app's interface is in Spanish (Spain).

**App:** https://jtorrast.github.io/blood-pressure/

## Development

```bash
npm install
npm run dev      # local dev server
npm run lint     # linter
npm run build    # build to dist/
npm run preview  # serve dist/ (to test the PWA and the service worker)
```

Every push to `main` is deployed automatically to GitHub Pages.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): features, architecture, data, decisions and iOS/Android specifics (in Spanish).
- [AGENTS.md](AGENTS.md): rules for working on the repository with AI agents (in Spanish).
