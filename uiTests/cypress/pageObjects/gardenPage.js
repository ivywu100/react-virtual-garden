export class gardenPage {
  plantAllButtonSelector = '[data-testid="plant-all"]';
  harvestAllButtonSelector = '[data-testid="harvest-all"]';
  expandRowButtonSelector = '[data-testid="expand-row"';
  expandColButtonSelector = '[data-testid="expand-col"]';
  shrinkRowButtonSelector = '[data-testid="shrink-row"]';
  shrinkColButtonSelector = '[data-testid="shrink-col"]';

  userInventorySectionSelector = '[data-testid="user-inventory"]';
  itemQuantitySelector = '[data-testid="item-qt"]';
  itemCostSelector = '[data-testid="item-cost"]';
  currentGoldSelector = '[data-testid="current-gold"]';

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

  get userInventorySection() {
    return cy.get(this.userInventorySectionSelector);
  }

  static gardenPlots() {
    const gardenPlotsSelector = '[data-testid="garden-plots"]';
    return cy.get(gardenPlotsSelector);
  }

  get itemQuantity() {
    return cy.get(this.itemQuantitySelector);
  }

  get itemCost() {
    return cy.get(this.itemCostSelector);
  }

  get getCurrentGold() {
    return cy.get(this.currentGoldSelector);
  }

  findInventoryQty(item) {
    return this.userInventorySection
      .contains(item)
      .parent()
      .parent()
      .find(this.itemQuantitySelector);
  }
}
