import { EmptyItemTemplate } from "../templates/EmptyItemTemplate";
import { ItemTemplate } from "../templates/ItemTemplate";
import { PlacedItemTemplate } from "../templates/PlacedItemTemplate";
import PlaceholderItemTemplates from "../templates/PlaceholderItemTemplate";
import { PlacedItem } from "./PlacedItem";

export class EmptyItem extends PlacedItem{
	constructor(itemData: EmptyItemTemplate, status: string) {
		super(itemData, status);
	}

	static fromPlainObject(plainObject: any): EmptyItem {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object' || !plainObject.itemData) {
                throw new Error('Invalid plainObject structure for EmptyItem');
            }
			// Validate required properties
			const { itemData, status } = plainObject;

			if (!itemData || typeof status !== 'string') {
				throw new Error('Invalid properties in plainObject for EmptyItem');
			}
	
			// Validate itemData structure
			const validatedItemData = EmptyItemTemplate.fromPlainObject(itemData);
	
			return new EmptyItem(validatedItemData, status);
		} catch (err) {
			console.error('Error creating EmptyItem from plainObject:', err);
            return new EmptyItem(EmptyItemTemplate.getErrorTemplate(), 'error');
		}
	}

	toPlainObject(): any {
		return {
			status: this.status,
			itemData: this.itemData.toPlainObject()
		}
	} 
}