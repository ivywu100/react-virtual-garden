import { BlueprintTemplate } from "./BlueprintTemplate";
import { DecorationTemplate } from "./DecorationTemplate";
import { EmptyItemTemplate } from "./EmptyItemTemplate";
import { HarvestedItemTemplate } from "./HarvestedItemTemplate";
import { InventoryItemTemplate } from "./InventoryItemTemplate";
import { PlacedItemTemplate } from "./PlacedItemTemplate";
import { PlantTemplate } from "./PlantTemplate";
import { SeedTemplate } from "./SeedTemplate";
import itemsData from '@/data/items/Items.json';

export class ItemTemplateRepository {
	PlacedItems: Record<string, PlacedItemTemplate[]> = {};
	InventoryItems: Record<string, InventoryItemTemplate[]> = {};

	constructor() {
		this.loadItems();
	}

  	loadItems() {
    // Example to load PlacedItems > Plants
    this.PlacedItems['Plants'] = itemsData.PlacedItems.Plants.map((item: any) =>
      new PlantTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value,
        item.transformId,
        item.baseExp,
		    item.growTime,
        item.repeatedGrowTime,
        item.numHarvests
      )
    );
	this.PlacedItems['Decorations'] = itemsData.PlacedItems.Decorations.map((item: any) =>
      new DecorationTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value,
        item.transformId,
      )
    );
	this.PlacedItems['Ground'] = itemsData.PlacedItems.Ground.map((item: any) =>
      new EmptyItemTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value,
        item.transformId
      )
    );
	this.InventoryItems['Seeds'] = itemsData.InventoryItems.Seeds.map((item: any) =>
      new SeedTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value,
        item.transformId
      )
    );
	this.InventoryItems['HarvestedItems'] = itemsData.InventoryItems.HarvestedItems.map((item: any) =>
      new HarvestedItemTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value
      )
    );
	this.InventoryItems['Blueprints'] = itemsData.InventoryItems.Blueprints.map((item: any) =>
      new BlueprintTemplate(
        item.id,
        item.name,
        item.icon,
        item.type,
        item.subtype,
        item.category,
        item.description,
        item.value,
        item.transformId
      )
    );
    // Repeat for other categories if needed
  	}
}
