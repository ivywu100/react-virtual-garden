export class garden {
  plantAllButtonSelector = '[data-testid="plant-all"]';
  harvestAllButtonSelector = '[data-testid="harvest-all"]';
  expandRowButtonSelector = '[data-testid="expand-row"';
  expandColButtonSelector = '[data-testid="expand-col"]';
  shrinkRowButtonSelector = '[data-testid="shrink-row"]';
  shrinkColButtonSelector = '[data-testid="shrink-col"]';

  get plantAllButton() {
    return cy.get(this.plantAllButtonSelector);
  }

  get harvestAllButton() {
    return cy.get(this.harvestAllButtonSelector);
  }

  get expandRowButton() {
    return cy.get(this.expandRowButtonSelector);
  }

  get expandColButton() {
    return cy.get(this.expandColButtonSelector);
  }

  get shrinkRowButton() {
    return cy.get(this.shrinkRowButtonSelector);
  }

  get shrinkColButton() {
    return cy.get(this.shrinkColButtonSelector);
  }

  static gardenPlots() {
    const gardenPlotsSelector = '[data-testid="garden-plots"]';
    return cy.get(gardenPlotsSelector);
  }
}
