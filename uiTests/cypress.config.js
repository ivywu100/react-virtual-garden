const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    numTestsKeptInMemory: 50,
    watchForFileChanges: false,
    baseUrl: "http://localhost:3000",
    testIsolation: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
