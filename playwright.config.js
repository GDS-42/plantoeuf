// Tests de bout en bout sur le fichier assemblé dist/index.html, ouvert en file://.
// Aucun serveur : c'est la condition d'usage réelle du livrable (ADR-004).
const path = require("node:path");
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test",
  testMatch: /.*\.(e2e|spec)\.js/,
  timeout: 30_000,
  retries: 0,
  reporter: "list",
  use: {
    browserName: "chromium",
    baseURL: "file://" + path.resolve(__dirname, "dist") + "/",
    locale: "fr-FR",
    timezoneId: "Indian/Reunion",
  },
});
