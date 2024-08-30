import { PlacedItemTemplateInterface } from "./PlacedItemTemplateInterface";

export interface PlantTemplateInterface extends PlacedItemTemplateInterface {
	baseExp: number;
	growTime: number;
	repeatedGrowTime: number;
	numHarvests: number;
	// Additional properties specific to inventory items, if any.
  }