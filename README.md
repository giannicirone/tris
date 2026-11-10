# tris
First repo Claude generated

Per giocare, apri `index.html` nel browser (basta un doppio clic sul file, funziona anche offline).

## Test e pipeline

- `npm install` e poi `npm test`: gioca nel browser tutte le 569 partite possibili e verifica che il computer non perda mai.
- **CI** (`.github/workflows/ci.yml`): esegue il test a ogni pull request.
- **CD** (`.github/workflows/deploy.yml`): dopo il merge su `main`, se il test passa, pubblica il gioco su GitHub Pages.
