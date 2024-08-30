Cypress.Commands.add("visitGarden", () => {
  cy.clearAllLocalStorage();
  cy.visit("http://localhost:3000/garden");
  cy.wait(2000);

  //wait for garden page to load
  // cy.visit("https://react-virtual-garden.vercel.app/garden");
  // cy.intercept("POST", "/_vercel/insights/view").as("pageLoaded");
  // cy.wait("@pageLoaded");
});
