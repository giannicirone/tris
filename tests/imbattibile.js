// Test end-to-end: gioca nel browser tutte le partite possibili, provando ogni
// sequenza di mosse dell'umano con clic reali, e verifica che:
// - l'umano non vinca mai (il computer è imbattibile);
// - le partite esplorate siano esattamente 569;
// - la pagina non abbia errori JavaScript;
// - la pagina non carichi risorse esterne (deve funzionare offline).
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const PARTITE_ATTESE = 569;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const erroriJs = [];
  const richiesteEsterne = [];
  page.on("pageerror", (e) => erroriJs.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith("file:")) richiesteEsterne.push(r.url());
  });

  await page.goto(pathToFileURL(path.join(__dirname, "..", "index.html")).href);

  const esiti = { vittorieUmano: 0, vittorieComputer: 0, pareggi: 0 };
  let partite = 0;

  async function nuovaPartita() {
    await page.evaluate(() => {
      const btn = document.getElementById("newGame");
      btn.hidden = false;
      btn.click();
    });
  }

  async function esplora(mosse) {
    await nuovaPartita();
    for (const i of mosse) await page.click(`.cell[data-index="${i}"]`);

    const stato = await page.textContent("#status");
    if (stato !== "Tocca a te") {
      partite++;
      if (stato.startsWith("Hai vinto")) esiti.vittorieUmano++;
      else if (stato.startsWith("Pareggio")) esiti.pareggi++;
      else if (stato.startsWith("Hai perso")) esiti.vittorieComputer++;
      else throw new Error(`Esito sconosciuto: "${stato}"`);

      if (!(await page.isVisible("#newGame"))) {
        throw new Error(`Pulsante "Nuova partita" non visibile dopo: ${mosse}`);
      }
      return;
    }

    const libere = await page.$$eval(".cell", (cs) =>
      cs.map((c, i) => (c.disabled ? -1 : i)).filter((i) => i >= 0)
    );
    for (const i of libere) await esplora([...mosse, i]);
  }

  await esplora([]);
  await browser.close();

  console.log({ partite, ...esiti, erroriJs, richiesteEsterne });

  const problemi = [];
  if (esiti.vittorieUmano > 0) problemi.push(`l'umano ha vinto ${esiti.vittorieUmano} partite`);
  if (partite !== PARTITE_ATTESE) problemi.push(`partite giocate ${partite}, attese ${PARTITE_ATTESE}`);
  if (erroriJs.length) problemi.push(`errori JavaScript: ${erroriJs.join("; ")}`);
  if (richiesteEsterne.length) problemi.push(`risorse esterne caricate: ${richiesteEsterne.join(", ")}`);

  if (problemi.length) {
    console.error("TEST FALLITO:\n- " + problemi.join("\n- "));
    process.exit(1);
  }
  console.log("TEST SUPERATO: il computer è imbattibile.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
