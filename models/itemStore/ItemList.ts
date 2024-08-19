
import { InventoryItem } from "../items/inventoryItems/InventoryItem";
import { ItemSubtype, ItemType, ItemTypes } from "../items/ItemTypes";
import { InventoryTransactionResponse } from "./inventory/InventoryTransactionResponse";
import { getItemClassFromSubtype, ItemConstructor } from "../items/utility/classMaps";
import { InventoryItemTemplate } from "../items/templates/models/InventoryItemTemplate";
import { ItemTemplate } from "../items/templates/models/ItemTemplate";
import { Item } from "../items/Item";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { BooleanResponse } from "../utility/BooleanResponse";


export class ItemList {
	private items: InventoryItem[];
	static fixedOrder = ['Seed', 'HarvestedItem', 'Blueprint'];
	constructor(items: InventoryItem[] = []) {
		this.items = items;
		this.sortItems(this.items);
	}

	private sortItems(list: any[]) {
		list.sort((a, b) => {
			const indexA = ItemList.fixedOrder.indexOf(a.itemData.subtype);
			const indexB = ItemList.fixedOrder.indexOf(b.itemData.subtype);
	
			// If a subtype is not in the fixedOrder array, it gets a large index number.
			// This keeps unknown subtypes at the end of the sorted array.
			const orderA = indexA !== -1 ? indexA : ItemList.fixedOrder.length;
			const orderB = indexB !== -1 ? indexB : ItemList.fixedOrder.length;
			
			if (orderA !== orderB) {
				return orderA - orderB;
			}

			//if subtype is the same, sort by name
			return a.itemData.name.localeCompare(b.itemData.name);
		});
	}

	static fromPlainObject(plainObject: any): ItemList {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object') {
                throw new Error('Invalid plainObject structure for ItemList');
            }
			const items = plainObject.items.map((item: any) => {
				if (!item) return null;
				const ItemClass = getItemClassFromSubtype(item);
				if (!ItemClass) {
					console.warn(`Unknown item type: ${item.subtype}`);
                    return null;
				}
				const toReturn = ItemClass.fromPlainObject(item);
				if (toReturn.itemData.name == 'error') {
					return null;
				}
				return toReturn;
			}).filter((item: null | InventoryItem) => item !== null);
			return new ItemList(items);
		} catch (err) {
			console.error('Error creating ItemList from plainObject:', err);
            return new ItemList();
		}
	}

	toPlainObject(): any {
		const toReturn = {
			items: this.items.map(item => {
				return item.toPlainObject();
			}) // Convert each InventoryItem to a plain object
		};
		return toReturn;
	} 

	/**
     * Check if item is an InventoryItem.
	 * @item The item to check.
     * @returns True/False
     */
	static isInventoryItem(item: any): item is InventoryItem {
		return item instanceof InventoryItem;
	}
	
	/**
     * Check if item is an ItemTemplate.
	 * @item The item to check.
     * @returns True/False
     */
	static isItemTemplate(item: any): item is ItemTemplate {
		return item instanceof ItemTemplate;
	}

	/**
	 * @returns a copy of the inventory items within the list.
	 */
	getAllItems(): InventoryItem[] {
		return this.items.slice();
	}

	
	/**
	 * @subtype the subtype string, ie. SEED, HARVESTED, BLUEPRINT
	 * @category (optional) the category string, ie. Allium, Normal
	 * @returns a copy of the inventory items matching the given subtype
	 */
	getItemsBySubtype(subtype: ItemSubtype, category: string | null = null): InventoryItem[] {
		if (!category) {
			return this.items.slice().filter((item) => item.itemData.subtype === subtype);
		}
		return this.items.slice().filter((item) => item.itemData.subtype === subtype && item.itemData.category === category);
	}

	//TODO: Needs unit tests
	/**
	 * @returns a list of strings containing all the subtypes of items in this itemlist
	 */
	getAllSubtypes(): string[] {
		const subtypes: string[] = [];
		this.items.forEach((item) => {
			if (!subtypes.includes(item.itemData.subtype)) {
				subtypes.push(item.itemData.subtype);
			}
		})
		// Sort subtypes based on their index in the fixedOrder array
		// this.sortItems(subtypes);
		subtypes.sort((a, b) => {
			const indexA = ItemList.fixedOrder.indexOf(a);
			const indexB = ItemList.fixedOrder.indexOf(b);
	
			// If a subtype is not in the fixedOrder array, it gets a large index number.
			// This keeps unknown subtypes at the end of the sorted array.
			const orderA = indexA !== -1 ? indexA : ItemList.fixedOrder.length;
			const orderB = indexB !== -1 ? indexB : ItemList.fixedOrder.length;
	
			return orderA - orderB;
		});
		return subtypes;
	}

	//TODO: Needs unit tests
	/**
	 * @subtype the subtype to search within
	 * @returns a list of strings containing all the categories of items in this itemlist
	 */
	getAllCategories(subtype: ItemSubtype): string[] {
		const categories: string[] = [];
		this.items.forEach((item) => {
			if (item.itemData.subtype === subtype && !categories.includes(item.itemData.category)) {
				categories.push(item.itemData.category);
			}
		})
		categories.sort();
		return categories;
	}

	/**
     * Converts an Item or ItemTemplate to its item name. Strings are unaffected. Can be used on Placed or InventoryItems.
	 * @item The item to convert, identified by Item, ItemTemplate, or name.
     * @returns InventoryTransactionResponse containing the name or an error message.
     */
	static getItemName(item: InventoryItem | PlacedItem | ItemTemplate | string): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		let itemName: string;
		if (typeof item === 'string') {
			itemName = item;
		} else if (typeof item === 'object' && ItemList.isItemTemplate(item)) {
			itemName = item.name;
		} else if (typeof item === 'object' && (item instanceof InventoryItem || item instanceof PlacedItem)) {
			itemName = item.itemData.name;
		} else {
			//Should never occur
			response.addErrorMessage(`Could not parse item: ${item}`);
			return response;
		}
		response.payload = itemName;
		return response;
	}

	/**
     * Converts an Item or ItemTemplate to its item id. Can be used on Placed or InventoryItems.
	 * @item The item to convert, identified by Item or ItemTemplate.
     * @returns InventoryTransactionResponse containing the id string or an error message.
     */
	 static getItemId(item: string | InventoryItem | PlacedItem | ItemTemplate): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		let itemId: string;
		if (typeof item === 'string') {
			itemId = item;
		} else if (typeof item === 'object' && ItemList.isItemTemplate(item)) {
			itemId = item.id;
		} else if (typeof item === 'object' && (item instanceof InventoryItem || item instanceof PlacedItem)) {
			itemId = item.itemData.id;
		} else {
			//Should never occur
			response.addErrorMessage(`Could not parse item: ${item}`);
			return response;
		}
		response.payload = itemId;
		return response;
	}

	/**
     * Get an item from the inventory.
     * @item The item to get, identified by InventoryItem, ItemTemplate, or name.
     * @returns InventoryTransactionResponse containing the found InventoryItem or error message.
     */
	getItem(item: InventoryItem | ItemTemplate | string): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		const itemNameResponse = ItemList.getItemName(item);
		if (!itemNameResponse.isSuccessful()) return itemNameResponse;
		const itemName = itemNameResponse.payload;

		this.items.forEach((element, index) => {
			if (element.itemData.name == itemName) {
				response.payload = element;
				return response;
			}
		})
		if (response.payload != null) return response;
		response.addErrorMessage(`item ${itemName} not found`);
		return response;
	}

	/**
     * Check if the inventory contains an item.
     * @item The item to check for, identified by InventoryItem, ItemTemplate, or name.
     * @returns BooleanResponse containing True/False or error message.
     */
	contains(item: InventoryItem | ItemTemplate | string): BooleanResponse {
		const response = new BooleanResponse();
		const itemNameResponse = ItemList.getItemName(item);
		if (!itemNameResponse.isSuccessful()) return itemNameResponse;
		const itemName = itemNameResponse.payload;
		
		this.items.forEach((element, index) => {
			if (element.itemData.name == itemName) {
				response.payload = true;
				return response;
			}
		})
		if (response.payload != null) return response;
		response.payload = false;
		return response;
	}

	/**
     * Check if the inventory contains at least quantity of an item.
     * @item The item to check for, identified by InventoryItem, ItemTemplate, or name.
	 * @quantity Amount to require
     * @returns BooleanResponse containing True/False or error message.
     */
	containsAmount(item: InventoryItem | ItemTemplate | string, quantity: number): BooleanResponse {
		const response = new BooleanResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}

		const itemNameResponse = ItemList.getItemName(item);
		if (!itemNameResponse.isSuccessful()) return itemNameResponse;
		const itemName = itemNameResponse.payload;
		
		this.items.forEach((element, index) => {
			if (element.itemData.name === itemName && element.getQuantity() >= quantity) {
				response.payload = true;
				return response;
			}
		})
		if (response.payload != null) return response;
		response.payload = false;
		return response;
	}

	/**
	 * Consumes x quantity from the specified item.
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
	useItem(item: InventoryItem | InventoryItemTemplate | string, quantity: number): InventoryTransactionResponse {
		let toUse = this.getItem(item);
		if (toUse.isSuccessful()) {
			const response = toUse.payload.use(quantity);
			return response;
		} else {
			//Item not found, fail
			const response = new InventoryTransactionResponse();
			response.addErrorMessage("item not in inventory");
			return response;
		}
	}

	/**
     * Add an item to the inventory.
     * @item The item to add.
     * @quantity The quantity of the item to add.
     * @returns InventoryTransactionResponse containing the added InventoryItem or error message
     */
	addItem(item: InventoryItem | InventoryItemTemplate, quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();

		let toUpdate = this.getItem(item);
		if (toUpdate.isSuccessful()) {
			//Item already in inventory, update quantity
			if (quantity === 0) {
				response.addErrorMessage('Quantity is 0, no change');
				return response;
			}
			if (quantity < 0) {
				response.addErrorMessage('Cannot remove items with add. Try update instead.');
				return response;
			}
			toUpdate.payload.quantity = toUpdate.payload.quantity + quantity;
			response.payload = toUpdate.payload;
			return response;
		} else {
			//Add item to inventory
			let newItem: InventoryItem;
			//TODO: Investigate type assertion
			if (ItemList.isInventoryItem(item)) {
				const itemClass = getItemClassFromSubtype(item) as ItemConstructor<InventoryItem>;
				newItem = new itemClass(item.itemData, quantity);
			} else if (ItemList.isItemTemplate(item) && item instanceof InventoryItemTemplate) {
				const itemClass = getItemClassFromSubtype(item)  as ItemConstructor<InventoryItem>;
				newItem = new itemClass(item, quantity);
				if (item.type === ItemTypes.PLACED.name) {
					response.addErrorMessage(`Cannot add a placeditem to inventory`);
					return response;
				}
			} else {
				//should never occur
				response.addErrorMessage(`Could not parse item of type ${typeof item}`);
				return response;
			}
			if (quantity === 0) {
				response.addErrorMessage('Quantity is 0, no item added');
				return response;
			}
			if (quantity < 0) {
				response.addErrorMessage('Cannot remove items with add. Try update instead.');
				return response;
			}
			if (newItem.itemData.name === 'error') {
				response.addErrorMessage('Cannot add error item.');
				return response;
			}
			//push to front of list
			this.items.push(newItem);
			this.sortItems(this.items);
			response.payload = newItem;
			return response;
		}
	}

	/**
     * Update the quantity of an item in the inventory.
     * @item The item to update, identified by InventoryItem, ItemTemplate, or name.
     * @delta The amount to change the quantity by. If negative and the final quantity ends up at or below 0, deletes the item from the list.
     * @returns InventoryTransactionResponse containing the updated InventoryItem or error message.
     */
	updateQuantity(item: InventoryItem | InventoryItemTemplate | string, delta: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		let toUpdate = this.getItem(item);
		if (toUpdate.isSuccessful()) {
			//Item already in inventory, update quantity
			if (delta < 0 && toUpdate.payload.quantity + delta <= 0) {
				return this.deleteItem(item);
			}

			toUpdate.payload.quantity = toUpdate.payload.quantity + delta;
			response.payload = toUpdate.payload;
			return response;
		} else {
			//Item not found, fail
			response.addErrorMessage("item not in inventory");
			return response;
		}
	}

	/**
     * Delete an item from the inventory.
     * @item The item to delete, identified by InventoryItem, ItemTemplate, or name.
     * @returns InventoryTransactionResponse containing the deleted InventoryItem with quantity set to 0 or error message.
     */
	deleteItem(item: InventoryItem | InventoryItemTemplate | string): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		let toDelete = this.getItem(item);
		if (toDelete.isSuccessful()) {
			//Item in inventory, delete
			response.payload = toDelete.payload;
			response.payload.quantity = 0;
			const toDeleteIndex = this.items.indexOf(toDelete.payload);
			this.items.splice(toDeleteIndex, 1);
			return response;
		} else {
			//Item not found, fail
			response.addErrorMessage("item not in inventory");
			return response;
		}
	}

	/**
	 * Deletes all items from the inventory.
	 * @returns InventoryTransactionResponse containing the deleted itemList or error message.
	 */
	deleteAll(): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		response.payload = this.getAllItems();
		this.items = [];
		return response;
	}

	/**
     * Get the size of the inventory.
     * @returns The number of items in the inventory.
     */
	size(): number {
		return this.items.length;
	}
}