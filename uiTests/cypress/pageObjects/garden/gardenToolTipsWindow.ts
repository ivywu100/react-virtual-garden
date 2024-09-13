export class gardenToolTipWindow {
  toolTipSelector = '[data-testid="tool-tip"]';
  toolNameSelector = '[data-testid="tool-name"]';
  toolSellPriceSelector = '[data-testid="tool-sell-price"]';
  toolCategorySelector = '[data-testid="tool-category"]';
  toolCategoryTypeSelector = '[data-testid="tool-category-type"]';
  toolStatusSelector = '[data-testid="tool-status"]';
  toolXPSelector = '[data-testid="tool-xp-gained"]';

  readyHarvestMessage = "Ready to harvest!";

  get toolTip() {
    return cy.get(this.toolTipSelector);
  }

  get toolName() {
    return cy.get(this.toolNameSelector);
  }

  get toolSellPrice() {
    return cy.get(this.toolSellPriceSelector);
  }

  get toolCategory() {
    return cy.get(this.toolCategorySelector);
  }

  get toolCategoryType() {
    return cy.get(this.toolCategoryTypeSelector);
  }

  get toolCategoryStatus() {
    return cy.get(this.toolStatusSelector);
  }

  get toolXP() {
    return cy.get(this.toolXPSelector);
  }
}
