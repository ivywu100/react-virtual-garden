import { groupEnd } from "console";
import { Blueprint } from "./inventoryItems/Blueprint";
import { HarvestedItem } from "./inventoryItems/HarvestedItem";
import { Seed } from "./inventoryItems/Seed";
import { ItemTemplate } from "./ItemTemplate";
import { Decoration } from "./placedItems/Decoration";
import { EmptyItem } from "./placedItems/EmptyItem";
import { Plant } from "./placedItems/Plant";

interface PlaceHolderItems {
    [key: string]: ItemTemplate;
}

export const PlaceHolderItems: PlaceHolderItems = {
	errorPlacedItem: new ItemTemplate(-1, "error", "X", "PlacedItem", "Plant", 0, -1),
	errorInventoryItem: new ItemTemplate(-2, "error", "X", "InventoryItem", "Seed", 0, -2),
	ground: new ItemTemplate(1, "ground", ".", "PlacedItem", "Ground", 0, 1),
	appleSeed: new ItemTemplate(2, "apple seed", "!", "InventoryItem", "Seed", 10, 3),
	apple: new ItemTemplate(3, "apple", "!", "PlacedItem", "Plant", 50, 4),
	harvestedApple: new ItemTemplate(4, "harvested apple", "!", "InventoryItem", "HarvestedItem", 50, 0),
	bananaSeed: new ItemTemplate(5, "banana seed", "!", "InventoryItem", "Seed", 20, 6),
	banana: new ItemTemplate(6, "banana", "!", "PlacedItem", "Plant", 100, 7),
	harvestedBanana: new ItemTemplate(7, "harvested banana", "!", "InventoryItem", "HarvestedItem", 100, 0),
	coconutSeed: new ItemTemplate(8, "coconut seed", "!", "InventoryItem", "Seed", 30, 9),
	coconut: new ItemTemplate(9, "coconut", "!", "PlacedItem", "Plant", 150, 10),
	harvestedCoconut: new ItemTemplate(10, "harvested coconut", "!", "InventoryItem", "HarvestedItem", 150, 0),
}

export const generateNewPlaceholderPlacedItem = (itemName: string, status: string) => {
	const itemData = PlaceHolderItems[itemName];
	if (itemData == null) return new Plant(PlaceHolderItems.errorPlacedItem, "error");
	switch (itemData.subtype) {
		case "Plant":
			return new Plant(itemData, status);
		case "Decoration":
			return new Decoration(itemData, status);
		case "Ground":
			return new EmptyItem(itemData, status);
		default:
			return new Plant(PlaceHolderItems.errorPlacedItem, "error");
	}
}

export const generateNewPlaceholderInventoryItem = (itemName: string, quantity: number) => {
	const itemData = PlaceHolderItems[itemName];
	if (itemData == null) return new Seed(PlaceHolderItems.errorInventoryItem, 1);
	switch (itemData.subtype) {
		case "Seed":
			return new Seed(itemData, quantity);
		case "Blueprint":
			return new Blueprint(itemData, quantity);
		case "HarvestedItem":
			return new HarvestedItem(itemData, quantity);
		default:
			return new Seed(PlaceHolderItems.errorInventoryItem, 1);
	}
}