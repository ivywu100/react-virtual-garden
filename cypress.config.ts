const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Add Mochawesome reporter
      on('after:run', (results) => {
        console.log('Tests finished:', results.totalFailed, 'failures')
      })
      return config
    },
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/results',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'yyyy-mm-dd-HHMMss'
    },
    // baseUrl: 'http://localhost:3000' // or your local URL
  }
})