import { ItemSubtypes } from "@/models/items/ItemTypes";
import { PlantTemplate } from "@/models/items/templates/models/PlantTemplate";
import { ItemHistoryTransactionResponse } from "./ItemHistoryTransactionResponse";
import ItemHistory from "./ItemHistory";

export class PlantHistory extends ItemHistory{
	
	protected itemData: PlantTemplate;
	protected harvestedQuantity: number;

	constructor(itemData: PlantTemplate, harvestedQuantity: number) {
		super(itemData);
		this.itemData = itemData;
		this.harvestedQuantity = harvestedQuantity;
	}

	/**
	 * Can return null if format is incorrect
	 */
	static fromPlainObject(plainObject: any) {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object') {
                throw new Error('Invalid plainObject structure for PlantHistory');
            }
			const { itemData, harvestedQuantity } = plainObject;
			// Perform additional type checks if necessary
			const validatedItemData = PlantTemplate.fromPlainObject(itemData);
			if (!(validatedItemData instanceof PlantTemplate) || validatedItemData.subtype !== ItemSubtypes.PLANT.name || validatedItemData.name === 'error') {
				throw new Error('Invalid itemData in plainObject for PlantHistory');
			}
			if (typeof harvestedQuantity !== 'number') {
				throw new Error('Invalid harvestedQuantity in plainObject for PlantHistory');
			}
			return new PlantHistory(validatedItemData, harvestedQuantity);
			
		} catch (err) {
			console.error('Error creating PlantHistory from plainObject:', err);
            return null;
		}
	}

	toPlainObject(): any {
		return {
			itemData: this.itemData,
			harvestedQuantity: this.harvestedQuantity
		};
	}

	/**
	 * @returns the itemtemplate for this history
	 */
	getItemData(): PlantTemplate {
		return this.itemData;
	}

	/**
	 * @returns the harvested quantity for this history
	 */
	getHarvestedQuantity(): number {
		return this.harvestedQuantity;
	}

	/**
	 * @delta the quantity change
	 * @returns the updated quantity
	 */
	updateHarvestedQuantity(delta: number): number {
		this.harvestedQuantity += delta;
		return this.harvestedQuantity;
	}

	/**
	 * Combines all fields from the given history into this one.
	 * @history the history to combine with
	 * @returns ItemHistoryTransactionResponse containing the updated PlantHistory or an error message
	 */
	combineHistory(history: PlantHistory): ItemHistoryTransactionResponse {
		const response = new ItemHistoryTransactionResponse();
		if (history.harvestedQuantity < 0) {
			response.addErrorMessage('Error combining PlantHistory: invalid harvestedQuantity');
			return response;
		}
		if (JSON.stringify(history.getItemData()) != JSON.stringify(this.itemData)) {
			response.addErrorMessage('Error combining PlantHistory: not identical templates');
			return response;
		}
		this.updateHarvestedQuantity(history.harvestedQuantity);
		response.payload = this;
		return response;
	}

}