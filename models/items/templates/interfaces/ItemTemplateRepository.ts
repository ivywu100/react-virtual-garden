import itemsData from '@/data/items/Items.json';
import { BlueprintTemplateInterface } from "../interfaces/BlueprintTemplateInterface";
import { InventoryItemTemplateInterface } from "../interfaces/InventoryItemTemplateInterface";
import { PlacedItemTemplateInterface } from "../interfaces/PlacedItemTemplateInterface";
import { DecorationTemplateInterface } from './DecorationTemplateInterface';
import { EmptyItemTemplateInterface } from './EmptyItemTemplateInterface';
import { HarvestedItemTemplateInterface } from './HarvestedItemTemplateInterface';
import { PlantTemplateInterface } from './PlantTemplateInterface';
import { SeedTemplateInterface } from './SeedTemplateInterface';

class ItemTemplateInterfaceRepository {
	PlacedItems: Record<string, PlacedItemTemplateInterface[]> = {};
	InventoryItems: Record<string, InventoryItemTemplateInterface[]> = {};

	constructor() {
		this.loadItems();
	}

	loadItems() {
		// Example to load PlacedItems > Plants
		this.PlacedItems['Plants'] = itemsData.PlacedItems.Plants.map((item: any) =>
		  this.createPlantTemplate(item)
		);
		this.PlacedItems['Decorations'] = itemsData.PlacedItems.Decorations.map((item: any) =>
		  this.createDecorationTemplate(item)
		);
		this.PlacedItems['Ground'] = itemsData.PlacedItems.Ground.map((item: any) =>
		  this.createEmptyItemTemplate(item)
		);
		this.InventoryItems['Seeds'] = itemsData.InventoryItems.Seeds.map((item: any) =>
		  this.createSeedTemplate(item)
		);
		this.InventoryItems['HarvestedItems'] = itemsData.InventoryItems.HarvestedItems.map((item: any) =>
		  this.createHarvestedItemTemplate(item)
		);
		this.InventoryItems['Blueprints'] = itemsData.InventoryItems.Blueprints.map((item: any) =>
		  this.createBlueprintTemplate(item)
		);
		// Repeat for other categories if needed
	  }
	
	  private createPlantTemplate(item: any): PlantTemplateInterface {
		return {
		  id: item.id,
		  name: item.name,
		  icon: item.icon,
		  type: item.type,
		  subtype: item.subtype,
		  category: item.category,
		  description: item.description,
		  value: item.value,
		  transformId: item.transformId,
		  baseExp: item.baseExp,
		  growTime: item.growTime,
		  repeatedGrowTime: item.repeatedGrowTime,
		  numHarvests: item.numHarvests,
		  // Add additional properties if needed
		};
	  }
	
	  private createDecorationTemplate(item: any): DecorationTemplateInterface {
		return {
		  id: item.id,
		  name: item.name,
		  icon: item.icon,
		  type: item.type,
		  subtype: item.subtype,
		  category: item.category,
		  description: item.description,
		  value: item.value,
		  transformId: item.transformId,
		  // Add additional properties if needed
		};
	  }
	
	  private createEmptyItemTemplate(item: any): EmptyItemTemplateInterface {
		return {
		  id: item.id,
		  name: item.name,
		  icon: item.icon,
		  type: item.type,
		  subtype: item.subtype,
		  category: item.category,
		  description: item.description,
		  value: item.value,
		  transformId: item.transformId,
		  // Add additional properties if needed
		};
	  }
	
	  private createSeedTemplate(item: any): SeedTemplateInterface {
		return {
		  id: item.id,
		  name: item.name,
		  icon: item.icon,
		  type: item.type,
		  subtype: item.subtype,
		  category: item.category,
		  description: item.description,
		  value: item.value,
		  transformId: item.transformId,
		  // Add additional properties if needed
		};
	  }
	
	  private createHarvestedItemTemplate(item: any): HarvestedItemTemplateInterface {
		return {
		  id: item.id,
		  name: item.name,
		  icon: item.icon,
		  type: item.type,
		  subtype: item.subtype,
		  category: item.category,
		  description: item.description,
		  value: item.value,
		  // Add additional properties if needed
		};
	  }

    private createBlueprintTemplate(item: any): BlueprintTemplateInterface {
      return {
        id: item.id,
        name: item.name,
        icon: item.icon,
        type: item.type,
        subtype: item.subtype,
		category: item.category,
		description: item.description,
        value: item.value,
        transformId: item.transformId,
        // Add additional properties if needed
      };
    }

    /**
	 * 
	 * @name the item name, ie apple. Note that there cannot be 2 placedItems with the same name, unless it is error
	 * @returns the found ItemTemplateInterface or null
	 */
	getPlacedItemTemplateInterfaceByName(name: string): PlacedItemTemplateInterface | null {
		const placedItems = Object.values(this.PlacedItems).flat().filter(item => item.name === name);
		if (placedItems.length === 1) return placedItems[0];
		else if (placedItems.length === 0) return null;
		else {
			console.error('Error: found multiple items with the same name!');
			console.error(placedItems);
			return null;
		}
	}

	/**
	 * @name the item name, ie apple seed. Note that there cannot be 2 inventoryItems with the same name, unless it is error
	 * @returns the found ItemTemplateInterface or null
	 */
	getInventoryItemTemplateInterfaceByName(name: string): InventoryItemTemplateInterface | null {
		const inventoryItems = Object.values(this.InventoryItems).flat().filter(item => item.name === name);
		if (inventoryItems.length === 1) return inventoryItems[0];
		else if (inventoryItems.length === 0) return null;
		else {
			console.error('Error: found multiple items with the same name!');
			console.error(inventoryItems);
			return null;
		}
	}
	

	//Write tests for these
	//Why is it null
	//TODO: Do we need to specify the returned value is correct template type?
	/**
	 * Placeholder, replace with grabbing from db later
	 * Grabs the placedItemTemplateInterface matching id
	 * Can return error templates
	 */
	getPlacedTemplateInterface(id: string): PlacedItemTemplateInterface | null {
		const placedItems = Object.values(this.PlacedItems).flat().filter(item => item.id === id);
		
		if (placedItems.length === 1) return placedItems[0];
		else if (placedItems.length === 0) return null;
		else {
			console.error('Error: found multiple items with the same id!');
			console.error(placedItems);
			return null;
		}
	}

	/**
	 * Placeholder, replace with grabbing from db later
	 * Grabs the inventoryItemTemplateInterface matching id
	 * Can return error templates
	 */
	getInventoryTemplateInterface(id: string): InventoryItemTemplateInterface | null {
		const inventoryItems = Object.values(this.InventoryItems).flat().filter(item => item.id === id);
		if (inventoryItems.length === 1) return inventoryItems[0];
		else if (inventoryItems.length === 0) return null;
		else {
			console.error('Error: found multiple items with the same id!');
			console.error(inventoryItems);
			return null;
		}
	}
}

export const itemTemplateInterfaceRepository = new ItemTemplateInterfaceRepository();