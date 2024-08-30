import { Inventory } from "../itemStore/inventory/Inventory";
import { InventoryItem } from "../items/inventoryItems/InventoryItem";
import { ItemSubtypes, ItemTypes } from "../items/ItemTypes";
import { EmptyItem } from "../items/placedItems/EmptyItem";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { generateNewPlaceholderPlacedItem } from "../items/PlaceholderItems";
import { GardenTransactionResponse } from "./GardenTransactionResponse";
import { getItemClassFromSubtype, ItemConstructor, itemTypeMap } from "../items/utility/classMaps";
import { Plant } from "../items/placedItems/Plant";
import { PlacedItemTemplate } from "../items/templates/models/PlacedItemTemplate";
import { placeholderItemTemplates } from "../items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "../items/templates/models/PlantTemplate";

export class Plot {
	private item: PlacedItem;
	private plantTime: number;
	private usesRemaining: number;

	constructor(item: PlacedItem, plantTime: number = Date.now(), usesRemaining: number | null = null) {
		this.item = item;
		this.plantTime = plantTime;
		if (usesRemaining && usesRemaining >= 0) {
			this.usesRemaining = usesRemaining;
		} else if (item.itemData.subtype === ItemSubtypes.PLANT.name) {
			//is a plant
			const plantTemplate = item.itemData as PlantTemplate;
			this.usesRemaining = plantTemplate.numHarvests;
		} else {
			//is non plant
			this.usesRemaining = 0;
		}
	}

	private static getGroundTemplate(): PlacedItemTemplate {
		const template = placeholderItemTemplates.getPlacedItemTemplateByName('ground');
		if (!template) throw new Error(`Error: Ground Template Does Not Exist!`);
		return template!;
	}

	static fromPlainObject(plainObject: any): Plot {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object' || !plainObject.item) {
                throw new Error('Invalid plainObject structure for Plot');
            }
			const { item, plantTime, harvestsRemaining } = plainObject;

            // Convert item if valid
			const itemType = getItemClassFromSubtype(item) as ItemConstructor<PlacedItem>;
            const hydratedItem = itemType.fromPlainObject(item);
			if (hydratedItem.itemData.name == 'error') {
				throw new Error('Invalid item in Plot');
			}
            return new Plot(hydratedItem, plantTime, harvestsRemaining);
        } catch (error) {
            console.error('Error creating Plot from plainObject:', error);
            // Return a default or empty Plot instance in case of error
			const ground = generateNewPlaceholderPlacedItem("ground", "empty");
            return new Plot(ground, Date.now(), 0);
        }
	}

	toPlainObject(): any {
		return {
			item: this.item.toPlainObject(),
			plantTime: this.plantTime,
			harvestsRemaining: this.usesRemaining,
		}
	} 

	/**
	 * @returns a copy of this plot.
	 */
	clone() {
		return new Plot(this.item, this.plantTime, this.usesRemaining);
	}

	/**
	 * @returns a copy of the item contained by this plot
	 */
	getItem(): PlacedItem {
		//TODO: Investigate type correction
		const itemClass = getItemClassFromSubtype(this.item);
		const newItem = new itemClass(this.item.itemData, this.item.getStatus()) as PlacedItem;
		return newItem;
	}

	/** 
	 * Replaces the existing item with a new one. Changes the plantTime.
	 * @item the item to replace with
	 * @plantTime the new plantTime, defaults to Date.now()
	 * @usesRemaining the number of uses, defaults to 0 for non plants, and numHarvests for plants. Should not be negative.
	 * @returns the changed item.
	 */
	setItem(item: PlacedItem, plantTime: number = Date.now(), usesRemaining: number | null = null): PlacedItem {
		this.item = item;
		this.plantTime = plantTime;
		if (usesRemaining && usesRemaining >= 0) {
			this.usesRemaining = usesRemaining;
		} else if (item.itemData.subtype === ItemSubtypes.PLANT.name) {
			//is a plant
			const plantTemplate = item.itemData as PlantTemplate;
			this.usesRemaining = plantTemplate.numHarvests;
		} else {
			//is non plant
			this.usesRemaining = 0;
		}
		return this.item;
	}

	/**
	 * @returns the time planted (as milliseconds from epoch time)
	 */
	getPlantTime(): number {
		return this.plantTime;
	}

	/** 
	 * @plantTime the new time planted (as milliseconds from epoch time), defaults to Date.now()
	 */
	setPlantTime(plantTime: number = Date.now()): void {
		this.plantTime = plantTime;
	}

	/**
	 * @returns the number of uses remaining
	 */
	getUsesRemaining(): number {
		return this.usesRemaining;
	}

	/** 
	 * @uses the new number of remaining uses
	 */
	setUsesRemaining(uses: number): void {
		this.usesRemaining = uses;
	}

	/**
	 * @delta the number of uses to change by
	 * @returns the new usesRemaining
	 */
	updateUsesRemaining(delta: number): number {
		this.usesRemaining += delta;
		return this.usesRemaining;
	}

	/**
	 * @returns the subtype of the item contained in this plot
	 */
	 getItemSubtype(): string {
		return this.item.itemData.subtype;
	}

	/**
	 * @returns the status
	 */
	 getItemStatus(): string {
		return this.item.getStatus();
	}

	/** Replaces the existing status
	 * @status the new status
	 */
	setItemStatus(status: string): void {
		this.item.setStatus(status);
	}

	/**
	 * If fertilizer/a way to increase usesRemaining for plants is created, this will break
	 * @returns the total number of seconds for the plant to finish growing and be ready for harvest
	 */
	getTotalGrowTime() {
		if (this.item.itemData.subtype !== ItemSubtypes.PLANT.name) {
			console.error('Error: attempting to get grow time of a non plant');
			return 0;
		}
		const plantTemplate = this.item.itemData as PlantTemplate;
		if (plantTemplate.numHarvests <= this.getUsesRemaining()) {
			return plantTemplate.growTime;
		} else {
			return plantTemplate.repeatedGrowTime;
		}
	}

	/**
	 * Returns the amount of time remaining for growing, as a readable string.
	 * @currentTime the current time
	 * @plantedTime the time the plant was planted
	 * @returns a string containing the time
	 */
	getRemainingGrowTime(currentTime: number = Date.now(), plantedTime: number = this.plantTime) {
		if (this.item.itemData.subtype !== ItemSubtypes.PLANT.name) {
			console.error('Error: attempting to get grow time of a non plant');
			return "Error: Not a plant!";
		}
		const item = this.item as Plant;
		if (currentTime > plantedTime + this.getTotalGrowTime() * 1000) {
			return "Ready to harvest!";
		}
		const remainingTime = Math.min(item.itemData.growTime, Math.max(1, Math.round((plantedTime + this.getTotalGrowTime() * 1000 - currentTime) / 1000)));
		// Calculate days, hours, minutes, and seconds
		const remainingDays = Math.floor(remainingTime / (24 * 3600));
		const remainingHours = Math.floor((remainingTime % (24 * 3600)) / 3600);
		const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
		const remainingSeconds = Math.floor(remainingTime % 60);

		// Format components with leading zeros
		const formattedDays = remainingDays.toString();
		const formattedHours = remainingHours.toString().padStart(2, '0');
		const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
		const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
		
		const isFirstGrowth = this.getUsesRemaining() === (this.item.itemData as PlantTemplate).numHarvests;

		const fullyGrownText = isFirstGrowth ? `Fully Grown in: ` : `Next Harvest in: `

		if (remainingTime < 60) {
			return `${fullyGrownText} ${remainingTime} seconds`;
		} else if (remainingTime < 3600) {
			return `${fullyGrownText} ${remainingMinutes}:${formattedSeconds}`;
		} else if (remainingTime < 3600 * 24) {
			return `${fullyGrownText} ${remainingHours}:${formattedMinutes}:${formattedSeconds}`;
		} else {
			return `${fullyGrownText} ${formattedDays}d ${formattedHours}:${formattedMinutes}`;
		}
	}

	/**
	 * Consumes a use from the item in this plot. If remainingUses falls to 0 or less, replaces the current item with the new item.
	 * Does not trigger side effects multiple times, even if numUses > 1
	 * If numUses > remainingUses, errors
	 * Performs a specific action depending on the item type:
	 * Decoration -> returns the Blueprint ItemTemplate corresponding to the Decoration
	 * Plant -> returns the HarvestedItem ItemTemplate corresponding to the Plant
	 * EmptyItem -> error
	 * @item the item to replace with. Default: ground
	 * @numUses the number of uses to consume from the plot
	 * @returns a response containing the following object, or an error message
	 * {originalItem: PlacedItem, 
	 *  replacedItem: PlacedItem, 
	 *  newTemplate: ItemTemplate}
	 */
	useItem(item: PlacedItem = new EmptyItem(Plot.getGroundTemplate(), ''), numUses: number = 1): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		const originalItem = this.item;
		let useItemResponse: GardenTransactionResponse;
		switch(item.itemData.subtype) {
			case ItemSubtypes.DECORATION.name:
			case ItemSubtypes.PLANT.name:
			case ItemSubtypes.GROUND.name:
				useItemResponse = this.item.use();
				if (!useItemResponse.isSuccessful()) {
					return useItemResponse;
				}
				if (this.getUsesRemaining() < numUses) {
					response.addErrorMessage(`Error: Cannot use item in plot ${numUses} times, only ${this.usesRemaining} uses left.`);
					return response;
				}
				this.updateUsesRemaining(-1 * numUses);
				if (this.getUsesRemaining() <= 0) {
					this.setItem(item);
				}
				break;
			default:
				response.addErrorMessage(`item is of type ${item.itemData.subtype}, cannot replace used item`);
				return response;
		}
		response.payload = {
			originalItem: originalItem,
			replacedItem: this.item,
			newTemplate: useItemResponse!.payload.newTemplate
		}

		return response;
	}

	/**
	 * Converts an inventoryItem into a PlacedItem, removes 1 quantity from it, and adds that item to this plot.
	 * Requires that this plot contains an emptyItem.
	 * Performs a specific action depending on the item type:
	 * Blueprint -> returns a new Decoration corresponding to the blueprint
	 * Seed -> returns a new Plant corresponding to the blueprint
	 * HarvestedItem -> error
	 * @inventory the inventory to modify
	 * @item the inventoryItem to convert
	 * @returns a response containing the following object, or an error message
	 *  {
			newItem: PlacedItem
		}
	 */
	placeItem(inventory: Inventory, item: InventoryItem): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		const originalItem = this.item;
		if (originalItem.itemData.subtype != ItemSubtypes.GROUND.name) {
			response.addErrorMessage(`existing item is of type ${originalItem.itemData.subtype} but should be ground, cannot place here`);
			return response;
		}
		let useItemResponse: GardenTransactionResponse;
		switch(item.itemData.subtype) {
			case ItemSubtypes.SEED.name:
			case ItemSubtypes.BLUEPRINT.name:
				//Type assertion?
				useItemResponse = inventory.useItem(item, 1);
				if (!useItemResponse.isSuccessful()) {
					return useItemResponse;
				}
				//TODO: Investigate type correction
				const newItemType = getItemClassFromSubtype(useItemResponse.payload.newTemplate);
				
				const newPlacedItem = new newItemType(useItemResponse.payload.newTemplate, "") as PlacedItem;
				this.setItem(newPlacedItem);
				break;
			default:
				response.addErrorMessage(`item is of type ${item.itemData.subtype}, cannot replace used item`);
				return response;
		}
		response.payload = {
			newItem: this.item
		}
		return response;
	}

	/**
	 * Converts the item in this plot into an InventoryItem, adds 1 quantity of it to inventory, and replaces the existing item in this plot with a new item.
	 * Requires that this plot contains a non emptyItem.
	 * Performs a specific action depending on the item type:
	 * Plant -> returns a new HarvestedItem
	 * Decoration -> returns a new Blueprint
	 * Ground -> Error
	 * @inventory the inventory to modify
	 * @updatedItem the item to replace with in this plot, defaults to ground.
	 * @returns a response containing the following object, or an error message
	 *  {
			pickedItem: PlacedItem
			newItem: InventoryItem
		}
	 */
	pickupItem(inventory: Inventory, updatedItem: PlacedItem = generateNewPlaceholderPlacedItem("ground", "")) {
		const response = new GardenTransactionResponse();
		if (updatedItem.itemData.type != ItemTypes.PLACED.name) {
			response.addErrorMessage(`item to replace with is of type ${updatedItem.itemData.type} but should be placedItem, cannot replace`);
			return response;
		}
		const originalItem = this.item;
		let useItemResponse: GardenTransactionResponse;
		switch(originalItem.itemData.subtype) {
			case ItemSubtypes.PLANT.name:
			case ItemSubtypes.DECORATION.name:
				useItemResponse = originalItem.use();
				if (!useItemResponse.isSuccessful()) {
					return useItemResponse;
				}
				inventory.gainItem(useItemResponse.payload.newTemplate, 1);
				this.setItem(updatedItem);
				break;
			default:
				response.addErrorMessage(`item is of type ${originalItem.itemData.subtype}, cannot pickup item`);
				return response;
		}

		let findItemResponse = inventory.getItem(useItemResponse.payload.newTemplate);
		if (!findItemResponse.isSuccessful()) {
			response.addErrorMessage(`error adding item to inventory: ${findItemResponse.messages[0]}`);
			return response;
		}
		response.payload = {
			pickedItem: originalItem,
			newItem: findItemResponse.payload
		}
		return response;
	}

	/**
	 * Checks if the plant in this plot is finished growing, then picks it up and adds a harvestedItem to inventory.
	 * If this is a multiharvest plant with harvests remaining afterwards, the plant stays.
	 * @inventory the inventory to modify
	 * @instantHarvest if set to true, ignores grow times
	 * @numHarvests the number of harvests
	 * @updatedItem the item to replace with in this plot, defaults to ground.
	 * @currentTime the time in milliseconds since epoch time. Only used for testing.
	 * @returns a response containing the following object, or an error message
	 *  {
			pickedItem: PlacedItem
			newItem: InventoryItem
		}
	 */
	harvestItem(inventory: Inventory, instantHarvest: boolean = false, numHarvests: number = 1, updatedItem: PlacedItem = generateNewPlaceholderPlacedItem("ground", ""), currentTime: number = Date.now()) {
		const response = new GardenTransactionResponse();
		//verify this plot contains a plant
		if (this.item.itemData.subtype !== ItemSubtypes.PLANT.name) {
			response.addErrorMessage(`Error: cannot harvest item of subtype ${this.item.itemData.subtype}`);
			return response;
		}
		// check if enough time passed
		const plant = this.item as Plant;
		const timeElapsed = currentTime - this.plantTime;
		if (!instantHarvest && timeElapsed < this.getTotalGrowTime() * 1000) {
			response.addErrorMessage(`Error: Plant is not ready to harvest. Needs ${plant.itemData.growTime - Math.round(timeElapsed / 1000)} more seconds.`);
			return response;
		}

		if (updatedItem.itemData.type != ItemTypes.PLACED.name) {
			response.addErrorMessage(`item to replace with is of type ${updatedItem.itemData.type} but should be placedItem, cannot replace`);
			return response;
		}
		const originalItem = this.item;
		let useItemResponse: GardenTransactionResponse;
		useItemResponse = originalItem.use();
		if (!useItemResponse.isSuccessful()) {
			return useItemResponse;
		}
		const harvestedAmt = Math.min(this.getUsesRemaining(), numHarvests);
		inventory.gainItem(useItemResponse.payload.newTemplate, harvestedAmt);
		this.updateUsesRemaining(-1 * numHarvests);
		if (this.getUsesRemaining() <= 0) {
			this.setItem(updatedItem);
		}
		this.setPlantTime();

		let findItemResponse = inventory.getItem(useItemResponse.payload.newTemplate);
		if (!findItemResponse.isSuccessful()) {
			response.addErrorMessage(`error adding item to inventory: ${findItemResponse.messages[0]}`);
			return response;
		}
		response.payload = {
			pickedItem: originalItem,
			newItem: findItemResponse.payload
		}

		return response;
	}

	/**
	 * @returns the amount of xp given by this item
	 */
	getExpValue() {
		if (this.item.itemData.subtype === ItemSubtypes.PLANT.name) {
			const template = this.item.itemData as PlantTemplate;
			return Math.max(1, template.baseExp);
		} else {
			return 0;
		}
	}
}