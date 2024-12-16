import { InventoryTransactionResponse } from "@/models/itemStore/inventory/InventoryTransactionResponse";
import { Item } from "../Item";
import { ItemSubtypes} from "../ItemTypes";
import { BlueprintTemplate } from "../templates/models/BlueprintTemplate";
import { InventoryItemTemplate } from "../templates/models/InventoryItemTemplate";
import { placeholderItemTemplates } from "../templates/models/PlaceholderItemTemplate";
import { SeedTemplate } from "../templates/models/SeedTemplate";

export interface InventoryItemEntity {
	id: string,
	owner: string, //maps to inventory
	identifier: string, //itemData.id
	quantity: number
}

export interface StoreItemEntity {
	id: string,
	owner: string, //maps to store
	identifier: string, //itemData.id
	quantity: number
}

export abstract class InventoryItem extends Item {
	protected inventoryItemId: string;
	itemData: InventoryItemTemplate;
	protected quantity: number;
	
	constructor(inventoryItemId: string, itemData: InventoryItemTemplate, quantity: number) {
		super();
		this.inventoryItemId = inventoryItemId;
		this.itemData = itemData;
		this.quantity = quantity;
	}


	static fromPlainObject(plainObject: any): InventoryItem {
        throw new Error("fromPlainObject must be implemented in subclasses");
    }

	abstract toPlainObject(): any;

	/**
	 * @returns the inventoryItemId for database access
	 */
	getInventoryItemId(): string {
		return this.inventoryItemId;
	}

	/**
	 * TODO: Fix any function that uses this, this is a dangerous operation
	 * Sets the id for database access.
	 */
	 setInventoryItemId(newId: string): void {
		this.inventoryItemId = newId;
	}
	
	/**
	 * @returns the quantity
	 */
	getQuantity(): number {
		return this.quantity;
	}

	/** 
	 * Replaces the existing quantity
	 * @quantity the new quantity
	 */
	setQuantity(quantity: number): void {
		this.quantity = quantity;
	}

	/**
	 * Consumes x quantity from the specified item.
	 * Performs a specific action depending on the item type:
	 * Blueprint -> returns the Decoration ItemTemplate corresponding to the Blueprint
	 * Seed -> returns the Plant ItemTemplate corresponding to the Seed
	 * HarvestedItem -> error
	 * Fails if there is not enough quantity of item
	 * @quantity the number of item used
	 * @returns a response containing the following object, or an error message
	 * {originalItem: InventoryItem
	 *  newTemplate: ItemTemplate}
	 */
	use(quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (this.getQuantity() < quantity) {
			response.addErrorMessage(`item lacks the required quantity to use, needs ${quantity} and has ${this.getQuantity()}`);
			return response;
		}
		switch(this.itemData.subtype) {
			case ItemSubtypes.BLUEPRINT.name:
				//TODO: Replace type assertion with guard
				const blueprintData = this.itemData as BlueprintTemplate;
				response.payload = {
					originalItem: this,
					newTemplate: placeholderItemTemplates.getPlacedTemplate(blueprintData.transformId),
				};
				this.setQuantity(this.getQuantity() - quantity);
				break;
			case ItemSubtypes.SEED.name:
				const seedData = this.itemData as SeedTemplate;
				response.payload = {
					originalItem: this,
					newTemplate: placeholderItemTemplates.getPlacedTemplate(seedData.transformId),
				};
				this.setQuantity(this.getQuantity() - quantity);
				break;
			default:
				response.addErrorMessage(`item is of type ${this.itemData.subtype}, cannot be used`);
				break;
		}
		return response;
	}
}