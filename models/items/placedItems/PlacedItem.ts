import { GardenTransactionResponse } from "@/models/garden/GardenTransactionResponse";
import { Item } from "../Item";
import { ItemSubtypes } from "../ItemTypes";
import { PlacedItemTemplate } from "../templates/models/PlacedItemTemplate";
import { placeholderItemTemplates } from "../templates/models/PlaceholderItemTemplate";

export abstract class PlacedItem extends Item { 
	itemData: PlacedItemTemplate;
	protected status: string;

	constructor(itemData: PlacedItemTemplate, status: string) {
		super();
		this.itemData = itemData;
		this.status = status;
	}

	// static fromPlainObject(plainObject: any): PlacedItem {
	// 	try {
    //         // Validate plainObject structure
    //         if (!plainObject || typeof plainObject !== 'object') {
    //             throw new Error('Invalid plainObject structure for PlacedItem');
    //         }
	// 		// Validate required properties
	// 		const { itemData, status } = plainObject;

	// 		if (!itemData || typeof status !== 'string') {
	// 			throw new Error('Invalid properties in plainObject for PlacedItem');
	// 		}
	
	// 		// Validate itemData structure
	// 		const validatedItemData = PlacedItemTemplate.fromPlainObject(itemData);
	
	// 		return new PlacedItem(validatedItemData, status);
	// 	} catch (err) {
	// 		console.error('Error creating PlacedItem from plainObject:', err);
    //         return new PlacedItem(PlacedItemTemplate.getErrorTemplate(), 'error');
	// 	}
	// }

	// toPlainObject(): any {
	// 	return {
	// 		status: this.status,
	// 		itemData: this.itemData.toPlainObject()
	// 	}
	// } 

	static fromPlainObject(plainObject: any): PlacedItem {
        throw new Error("fromPlainObject must be implemented in subclasses");
    }

	abstract toPlainObject(): any;

	/**
	 * @returns the status
	 */
	 getStatus(): string {
		return this.status.slice();
	}

	/** Replaces the existing status
	 * @status the new status
	 */
	setStatus(status: string): void {
		this.status = status;
	}

	/**
	 * Performs a specific action depending on the item type:
	 * Decoration -> returns the Blueprint ItemTemplate corresponding to the Decoration
	 * Plant -> returns the HarvestedItem ItemTemplate corresponding to the Plant
	 * EmptyItem -> error
	 * @returns a response containing the following object, or an error message
	 * {originalItem: PlacedItem
	 *  newTemplate: ItemTemplate}
	 */
	 use(): GardenTransactionResponse {
		const response = new GardenTransactionResponse();
		switch(this.itemData.subtype) {
			case ItemSubtypes.DECORATION.name:
			case ItemSubtypes.PLANT.name:
				response.payload = {
					originalItem: this,
					newTemplate: placeholderItemTemplates.getInventoryTemplate(this.itemData.transformId),
				};
				// this.setStatus('removed');
				break;
			default:
				response.addErrorMessage(`item is of type ${this.itemData.subtype}, cannot be used`);
				break;
		}
		return response;
	}
}