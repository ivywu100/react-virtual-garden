export default class tradeWindow{
  tradeWindowLabelSelector = '[data-testid="trade-window"]'
  confirmTransactionButtonSelector = '[data-testid="confirm-transaction"]';
  addItemButtonSelector = '[data-testid="add-item"]';
  minusItemButtonSelector = '[data-testid="minus-item"]';

  get confirmTransactionButton() {
    return cy.get(this.confirmTransactionButtonSelector);
  }

  get addItemButton() {
    return cy.get(this.addItemButtonSelector);
  }

  get minusItemButton() {
    return cy.get(this.minusItemButtonSelector);
  }

  

}