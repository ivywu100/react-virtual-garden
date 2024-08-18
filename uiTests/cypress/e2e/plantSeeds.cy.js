import { gardenPlot } from "../pageObjects/gardenPlot";
import { gardenPage } from "../pageObjects/gardenPage";
import { toolTipWindow } from "../pageObjects/toolTipsWindow";

describe("should plant seeds and harvest plants in garden", () => {
  const gardenPlots = new gardenPlot();
  const gardenPg = new gardenPage();
  const toolTips = new toolTipWindow();
  let rowLen;
  let colLen;
  let curGold;

  const seedToPlant = "apple seed";

  before(() => {
    cy.visitGarden();
    gardenPlots.getRows().then($val => {
      rowLen = $val;
    });

    gardenPlots.getCols().then($val => {
      colLen = $val;
    });

    gardenPg.getCurrentGold.then($val => {
      curGold = parseInt($val.text().replace("Gold: ", ""));
    });
  });

  it("should plant seed in each plot", () => {
    gardenPg.userInventorySection.contains("apple seed").click();
    gardenPlots.individuallySelectAllPlots();
    gardenPage.gardenPlots().contains("_").should("not.exist");

    let applesRemoved = curGold - rowLen * colLen;
    gardenPg.findInventoryQty(seedToPlant).then($val => {
      expect(parseInt($val.text())).to.equal(applesRemoved);
    });
  });

  it("should confirm plant tool tip contains correct information", () => {
    toolTips.toolTip.then(() => {
      toolTips.toolName.should("have.text", "apple");
      toolTips.toolSellPrice.then($val => {
        expect($val.text().replace("💰", "").trim()).to.equal("20");
      });
      toolTips.toolCategory.should("have.text", "Plant");
      toolTips.toolCategoryType.should("contains", "Tree Fruit");
      toolTips.toolCategoryStatus.contains(toolTips.readyHarvestMessage);
      toolTips.toolXP.should("have.text", "2");
    });
  });

  it("should harvest plants", () => {
    cy.log(rowLen);
  });

  it("should plant seed with Plant All", () => {});

  it("should harvest all plants with Harvest All", () => {});
});
