import cypressFailFast from "cypress-fail-fast/plugin";
import { defineConfig } from 'cypress'

export default defineConfig({
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
