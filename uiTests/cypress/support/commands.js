Cypress.Commands.add("visitGarden", () => {
  cy.clearAllSessionStorage();
  cy.clearAllLocalStorage();
  cy.visit("http://localhost:3000/garden");
  cy.wait(2000);

  //wait for garden page to load
  // cy.intercept("POST", "/_vercel/insights/view").as("pageLoaded");
  // cy.wait("@pageLoaded");
});
