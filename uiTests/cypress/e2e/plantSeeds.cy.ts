import { gardenPlot } from "../pageObjects/garden/gardenPlot";
import { garden } from "../pageObjects/garden/garden";
import { gardenToolTipWindow } from "../pageObjects/garden/gardenToolTipsWindow";
import { inventory } from "../pageObjects/inventory/inventory";

describe("should plant seeds and harvest plants in garden", () => {
  const gardenPlots = new gardenPlot();
  const gardenPg = new garden();
  const toolTips = new gardenToolTipWindow();
  const userInventory = new inventory();
  let rowLen: number;
  let colLen: number;
  let curGold: number;

  const seedToPlant = "apple seed";

  before(() => {
    cy.visitGarden();
  });

  beforeEach(() => {
    gardenPlots.getRows().then(val => {
      rowLen = val;
    });

    gardenPlots.getCols().then(val => {
      colLen = val;
    });

    userInventory.getCurrentGold.then(val => {
      curGold = parseInt(val.text().replace("Gold: ", ""));
    });
  });

  it("should plant seed in each plot", () => {
    userInventory.userInventorySection.contains("apple seed").click();
    gardenPlots.individuallySelectAllPlots();
    garden.gardenPlots().contains("_").should("not.exist");

    let applesRemoved = curGold - rowLen * colLen;
    userInventory.findInventoryQty(seedToPlant).then(val => {
      expect(parseInt(val.text())).to.equal(applesRemoved);
    });
  });

  it("should confirm plant tool tip contains correct information", () => {
    toolTips.toolTip.first().within(() => {
      toolTips.toolName.should("have.text", "apple");
      toolTips.toolSellPrice.then(val => {
        expect(val.text().replace("💰", "").trim()).to.equal("15");
      });
      toolTips.toolCategory.should("have.text", "Plant");
      toolTips.toolCategoryType.then(val => {
        expect(val.text().replace("Category: ", "")).to.equal("Tree Fruit");
      });
      toolTips.toolCategoryStatus.contains(toolTips.readyHarvestMessage, {
        timeout: 11000,
      });
      toolTips.toolXP.then(val => {
        expect(val.text().replace("XP Gained: ", "")).to.equal("2");
      });
    });
    gardenPlots.singlePlot.last().trigger("mouseout");
  });

  it("should harvest plants with Harvest All", () => {
    gardenPg.harvestAllButton.click();
  });

  it("should plant seed with Plant All", () => {
    gardenPg.plantAllButton.click();
  });

  it("should confirm plant tool tip contains correct information plant all", () => {

    gardenPlots.singlePlot.last().trigger("mouseover");
    toolTips.toolTip.first().within(() => {
      toolTips.toolName.should("have.text", "apple");
      toolTips.toolSellPrice.then(val => {
        expect(val.text().replace("💰", "").trim()).to.equal("15");
      });
      toolTips.toolCategory.should("have.text", "Plant");
      toolTips.toolCategoryType.then(val => {
        expect(val.text().replace("Category: ", "")).to.equal("Tree Fruit");
      });
      toolTips.toolCategoryStatus.contains(toolTips.readyHarvestMessage, {
        timeout: 11000,
      });
      toolTips.toolXP.then(val => {
        expect(val.text().replace("XP Gained: ", "")).to.equal("2");
      });
    });
  });

  it("should harvest all plants", () => {
    gardenPlots.singlePlot.last().trigger("mouseout");
    gardenPlots.individuallySelectAllPlots();
  });
});
