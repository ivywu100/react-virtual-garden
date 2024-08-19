import { ItemSubtypes } from "@/models/items/ItemTypes";
import { DecorationTemplate } from "@/models/items/templates/models/DecorationTemplate";
import { ItemHistoryTransactionResponse } from "./ItemHistoryTransactionResponse";
import ItemHistory from "./ItemHistory";
import { PlantHistory } from "./PlantHistory";

export class DecorationHistory extends ItemHistory{
	
	protected itemData: DecorationTemplate;
	protected placedQuantity: number;

	constructor(itemData: DecorationTemplate, placedQuantity: number) {
		super(itemData);
		this.itemData = itemData;
		this.placedQuantity = placedQuantity;
	}

	/**
	 * Can return null if format is incorrect
	 */
	static fromPlainObject(plainObject: any) {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object') {
                throw new Error('Invalid plainObject structure for DecorationHistory');
            }
			const { itemData, placedQuantity } = plainObject;
			// Perform additional type checks if necessary
			const validatedItemData = DecorationTemplate.fromPlainObject(itemData);
			if (!(validatedItemData instanceof DecorationTemplate) || validatedItemData.subtype !== ItemSubtypes.DECORATION.name || validatedItemData.name === 'error') {
				throw new Error('Invalid itemData in plainObject for DecorationHistory');
			}
			if (typeof placedQuantity !== 'number') {
				throw new Error('Invalid placedQuantity in plainObject for DecorationHistory');
			}
			return new DecorationHistory(validatedItemData, placedQuantity);
			
		} catch (err) {
			console.error('Error creating DecorationHistory from plainObject:', err);
            return null;
		}
	}

	toPlainObject(): any {
		return {
			itemData: this.itemData,
			placedQuantity: this.placedQuantity,
		};
	}

	/**
	 * @returns the itemtemplate for this history
	 */
	getItemData(): DecorationTemplate {
		return this.itemData;
	}

	/**
	 * @returns the placed quantity for this history
	 */
	getPlacedQuantity(): number {
		return this.placedQuantity;
	}

	/**
	 * @delta the quantity change
	 * @returns the updated quantity
	 */
	updatePlacedQuantity(delta: number): number {
		this.placedQuantity += delta;
		return this.placedQuantity;
	}

	/**
	 * Combines all fields from the given history into this one.
	 * @history the history to combine with
	 * @returns ItemHistoryTransactionResponse containing the updated DecorationHistory or an error message
	 */
	combineHistory(history: DecorationHistory): ItemHistoryTransactionResponse {
		const response = new ItemHistoryTransactionResponse();
		if (history.placedQuantity < 0) {
			response.addErrorMessage('Error combining DecorationHistory: invalid placedQuantity');
			return response;
		}
		if (JSON.stringify(history.getItemData()) != JSON.stringify(this.itemData)) {
			response.addErrorMessage('Error combining DecorationHistory: not identical templates');
			return response;
		}
		this.updatePlacedQuantity(history.placedQuantity);
		response.payload = this;
		return response;
	}

}