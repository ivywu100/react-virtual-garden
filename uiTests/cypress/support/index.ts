declare namespace Cypress {
  interface Chainable {
    visitGarden(): Chainable<Element>;
  }
}