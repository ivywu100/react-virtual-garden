export class inventory{
  userInventorySectionSelector = '[data-testid="user-inventory"]';
  itemQuantitySelector = '[data-testid="item-qt"]';
  itemCostSelector = '[data-testid="item-cost"]';
  currentGoldSelector = '[data-testid="current-gold"]';

  get userInventorySection() {
    return cy.get(this.userInventorySectionSelector);
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

  findInventoryQty(item: string) {
    return this.userInventorySection
      .contains(item)
      .parent()
      .parent()
      .find(this.itemQuantitySelector);
  }
}