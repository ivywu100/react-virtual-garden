import cypressFailFast from "cypress-fail-fast/plugin";
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    numTestsKeptInMemory: 100,
    watchForFileChanges: false,
    baseUrl: "http://localhost:3000",
    testIsolation: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      cypressFailFast(on, config);
    },
  },
});
