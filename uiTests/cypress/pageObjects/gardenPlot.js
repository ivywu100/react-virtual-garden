import { gardenPage } from "./gardenPage";

export class gardenPlot {
  singlePlotSelector = '[data-testid="plot"]';
  toolTipSelector = '[data-testid="tool-tip"]';

  get singlePlot() {
    return cy.get(this.singlePlotSelector);
  }

  get toolTip() {
    return cy.get(this.toolTipSelector);
  }

  getRows() {
    return cy
      .get(this.singlePlotSelector)
      .first()
      .parent()
      .parent()
      .children()
      .its("length");
  }

  getCols() {
    return cy
      .get(this.singlePlotSelector)
      .first()
      .parent()
      .parent()
      .parent()
      .children()
      .its("length");
  }

  individuallySelectAllPlots() {
    const plots = gardenPage.gardenPlots();
    plots.children().each($row => {
      cy.wrap($row)
        .children()
        .each($plot => {
          cy.wrap($plot).find(this.singlePlotSelector).click();
        });
    });
  }
}
