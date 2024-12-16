import { InventoryItem } from "../../items/inventoryItems/InventoryItem";
import { ItemTypes } from "../../items/ItemTypes";
import { InventoryTransactionResponse } from "./InventoryTransactionResponse";
import { ItemList } from "../ItemList";
import { ItemStore } from "../ItemStore";
import { ItemTemplate } from "@/models/items/templates/models/ItemTemplate";
import { v4 as uuidv4 } from 'uuid';
import { generateNewPlaceholderInventoryItem } from "@/models/items/PlaceholderItems";
import User from "@/models/user/User";

export interface InventoryEntity {
	id: string,
	owner: string,
	gold: number
}

export class Inventory extends ItemStore{
	private inventoryId: string;
	private ownerName: string;
	private gold: number;
	// private items: ItemList;
	
	constructor(inventoryId: string, ownerName: string, gold: number = 0, items: ItemList = new ItemList()) {
		super(items);
		this.inventoryId = inventoryId;
		this.ownerName = ownerName;
		this.gold = gold;
		// this.items = items;
	}

	static fromPlainObject(plainObject: any): Inventory {
		//Throwing an error will be caught by loadInventory
		// Validate plainObject structure
		if (!plainObject || typeof plainObject !== 'object') {
			throw new Error('Invalid plainObject structure for Inventory');
		}
		
		// Initialize default values
		let inventoryId = uuidv4();
		let ownerName = '';
		let gold = 0;
		let items = new ItemList();
		// Validate and assign ownerName
		if (plainObject && typeof plainObject.inventoryId === 'string') {
			inventoryId = plainObject.inventoryId;
		}
	
		// Validate and assign ownerName
		if (plainObject && typeof plainObject.ownerName === 'string') {
			ownerName = plainObject.ownerName;
		}
	
		// Validate and assign gold
		if (plainObject && typeof plainObject.gold === 'number') {
			gold = plainObject.gold;
		}
	
		// Validate and assign items
		if (plainObject && plainObject.items !== undefined) {
			if (typeof plainObject.items === 'object' && plainObject.items !== null) {
				items = ItemList.fromPlainObject(plainObject.items) || new ItemList();
			}
		}
	
		return new Inventory(inventoryId, ownerName, gold, items);
		
	}

	toPlainObject(): any {
		return {
			inventoryId: this.inventoryId,
			ownerName: this.ownerName,
			gold: this.gold,
			items: this.items.toPlainObject()
		}
	} 
	
	static generateDefaultNewInventory(): Inventory {
		const randomUuid = uuidv4();
		return new Inventory(randomUuid, User.getDefaultUserName(), 100, new ItemList([
			generateNewPlaceholderInventoryItem('apple seed', 100)]));
	}

	/**
	 * @returns the inventory id for database access
	 */
	 getInventoryId(): string {
		return this.inventoryId;
	}

	/**
	 * @returns the name of the owner of the inventory.
	 */
	getOwnerName(): string {
		return this.ownerName;
	}

	/**
	 * @returns the amount of gold in inventory.
	 */
	getGold(): number {
		return this.gold;
	}

	/**
     * Gains quantity gold.
	 * @quantity Positive integer amount of item being added.
     * @returns InventoryTransactionResponse containing the ending gold amount or an error message.
     */
	addGold(quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}
		this.gold += quantity;
		response.payload = this.gold;
		return response;
	}

	/**
     * Removes quantity gold from inventory. If reduced to below 0, sets gold to 0 instead.
	 * @quantity Positive integer amount of gold being removed.
     * @returns InventoryTransactionResponse containing the ending gold amount or an error message.
     */
	removeGold(quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}
		this.gold -= quantity;
		if (this.gold < 0) {
			this.gold = 0;
		}
		response.payload = this.gold;
		return response;
	}


	/**
     * Spends gold to add items to inventory. Fails if there is not enough gold.
     * @item The item to add, identified by InventoryItem or ItemTemplate.
	 * @multiplier Value that the base price is modified by.
	 * @quantity Amount of item being purchased.
     * @returns InventoryTransactionResponse containing the following object or an error message.
	 * {finalGold: number,
	 *  purchasedItem: InventoryItem}
     */
	buyItem(item: InventoryItem | ItemTemplate, multiplier: number, quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}

		let itemCost: number;
		if (ItemList.isInventoryItem(item)) {
			itemCost = item.itemData.getPrice(multiplier);
		} else if (ItemList.isItemTemplate(item)) {
			itemCost = item.getPrice(multiplier);
			if (item.type === ItemTypes.PLACED.name) { //we check this before the addItem call so that we don't return not enough money
				response.addErrorMessage(`Cannot add a placeditem to inventory`);
				return response;
			}
		} else {
			//should never occur
			response.addErrorMessage(`Could not parse item: ${item}`);
			return response;
		}

		if (this.gold >= itemCost * quantity) {
			const buyItemResponse = this.addItem(item, quantity);
			if (buyItemResponse.isSuccessful()) {
				const removeGoldResponse = this.removeGold(itemCost * quantity);
				if (!removeGoldResponse.isSuccessful()) return removeGoldResponse;
				response.payload = {
					finalGold: this.getGold(),
					purchasedItem: buyItemResponse.payload
				}
				return response;
			} else {
				return buyItemResponse;
			}
		} else {
			response.addErrorMessage(`Insufficient gold: had ${this.getGold()} but requires ${itemCost * quantity}`);
			return response;
		}
	}

	/**
     * Sells item from inventory. Fails if item is not in inventory.
     * @item The item to sell, identified by InventoryItem, ItemTemplate, or name
	 * @multiplier Value that the base price is modified by.
	 * @quantity Positive integer amount of item being sold.
     * @returns InventoryTransactionResponse containing the following object or an error message.
	 * {finalGold: number,
	 *  remainingItem: InventoryItem}
     */
	 sellItem(item: InventoryItem | ItemTemplate | string, multiplier: number, quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (!Number.isInteger(quantity) || quantity <= 0) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}

		const findItemResponse = this.getItem(item);
		if (!findItemResponse.isSuccessful()) {
			return findItemResponse;
		}
		let itemCost: number = findItemResponse.payload.itemData.getPrice(multiplier);

		const containsItem = this.items.containsAmount(item, quantity);
		if (!containsItem.payload) {
			const itemAmount = this.getItem(item).payload;
			if (itemAmount) {
				response.addErrorMessage(`Insufficient quantity in inventory: had ${itemAmount.quantity} but requires ${quantity}`);
			} else {
				response.addErrorMessage(`Insufficient quantity in inventory: had 0 but requires ${quantity}`);
			}
			return response;
		}

		const sellItemResponse = this.items.updateQuantity(item, -1 * quantity);
		if (sellItemResponse.isSuccessful()) {
			const addGoldResponse = this.addGold(itemCost * quantity);
			if (!addGoldResponse.isSuccessful()) return addGoldResponse;
			response.payload = {
				finalGold: this.getGold(),
				remainingItem: sellItemResponse.payload
			}
			return response;
		} else {
			return sellItemResponse;
		}
	}

	/**
	 * Consumes x quantity from the specified item. Fails if there is not enough quantity of item.
	 * Performs a specific action depending on the item type:
	 * Blueprint -> returns the Decoration ItemTemplate corresponding to the Blueprint
	 * Seed -> returns the Plant ItemTemplate corresponding to the Seed
	 * HarvestedItem -> error
	 * @item The item to use, identified by InventoryItem, ItemTemplate, or name.
	 * @quantity the quantity of item consumed
	 * @returns a response containing the following object, or an error message
	 * {originalItem: InventoryItem
	 *  newTemplate: ItemTemplate}
	 */
	 useItem(item: InventoryItem | ItemTemplate | string, quantity: number): InventoryTransactionResponse {
		const response = this.items.useItem(item, quantity);
		//Does not delete upon hitting 0 quantity
		// if (response.isSuccessful()) {
		// 	if (response.payload.originalItem.quantity <= 0) {
		// 		const deleteResponse = this.deleteItem(response.payload.originalItem);
		// 		if (!deleteResponse.isSuccessful()) {
		// 			response.addErrorMessage(`Error deleting item after using down to 0 quantity`);
		// 			return response;
		// 		}
		// 		//we throw away the response from delete if it succeeds
		// 	}
		// }
		return response;
	}


}