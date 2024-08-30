import { ItemList } from "../ItemList";
import { InventoryItem } from "../../items/inventoryItems/InventoryItem";
import { ItemStore } from "../ItemStore";
import { Inventory } from "../inventory/Inventory";
import { InventoryTransactionResponse } from "../inventory/InventoryTransactionResponse";
import { ItemTemplate } from "@/models/items/templates/models/ItemTemplate";
import { storeRepository } from "./StoreRepository";
import { stocklistRepository } from "./StocklistRepository";

export class Store extends ItemStore {
	private id: number;
	private storeName: string;
	private buyMultiplier: number;
	private sellMultiplier: number;
	private upgradeMultiplier: number;
	private stockList: ItemList;
	private restockTime: number;
	private restockInterval: number;

	constructor(id: number, name: string, buyMultiplier: number = 2, sellMultiplier: number = 1, upgradeMultiplier: number = 1, items: ItemList = new ItemList(), stockList: ItemList = new ItemList(), restockTime: number = Date.now(), restockInterval: number = 300000) {
		super(items);
		this.id = id;
		this.storeName = name;
		this.buyMultiplier = buyMultiplier;
		this.sellMultiplier = sellMultiplier;
		this.upgradeMultiplier = upgradeMultiplier;
		this.stockList = stockList;
		this.restockTime = restockTime;
		this.restockInterval = restockInterval;
		if (this.restockTime < Date.now()) {
			this.restockStore();
		}
	}

	static fromPlainObject(plainObject: any): Store {
		//Throwing an error will be caught by loadStore
		// Validate plainObject structure
		if (!plainObject || typeof plainObject !== 'object') {
			throw new Error('Invalid plainObject structure for Store');
		}
		// Initialize default values
		let id = 0;
		let storeName = 'Default Store';
		let items = new ItemList();
		// let stockList = new ItemList();
		let restockTime = Date.now();
	
		// Validate and assign id
		if (plainObject && typeof plainObject.id === 'number') {
			id = plainObject.id;
		}
	
		// Validate and assign storeName
		if (plainObject && typeof plainObject.storeName === 'string') {
			storeName = plainObject.storeName;
		}
	
		// Validate and assign items
		if (plainObject && plainObject.items !== undefined) {
			if (typeof plainObject.items === 'object' && plainObject.items !== null) {
				items = ItemList.fromPlainObject(plainObject.items) || new ItemList();
			}
		}

		//get stocklist from database

		//first, get store data
		let storeInterface = storeRepository.getStoreInterfaceById(id);
		if (!storeInterface) {
			storeInterface = storeRepository.getStoreInterfaceByName(storeName);
			if (!storeInterface) {
				storeInterface = storeRepository.getStoreInterfaceById(0);
				if (!storeInterface) {
					//hardcoded initial values if store with id 0 doesn't show up
					storeInterface = {id: id, name: storeName, stocklistId: "0", stocklistName: "Default Stocklist", buyMultiplier: 2, sellMultiplier: 1, upgradeMultiplier: 1, restockInterval: 300000};
				}
			}
		}

		//then get stocklist data
		let stocklistInterface = stocklistRepository.getStocklistInterfaceById(storeInterface.stocklistId);
		let stocklistItems = new ItemList();
		if (!stocklistInterface) {
			stocklistInterface = stocklistRepository.getStocklistInterfaceByName(storeInterface.stocklistName);
		}
		if (stocklistInterface) {
			stocklistItems = stocklistInterface.items;
		}

		// Validate and assign restockTime
		if (plainObject && typeof plainObject.restockTime === 'number') {
			restockTime = plainObject.restockTime;
		}
	
		return new Store(id, storeName, storeInterface.buyMultiplier, storeInterface.sellMultiplier, storeInterface.upgradeMultiplier, items, stocklistItems, restockTime, storeInterface.restockInterval);
	}

	toPlainObject(): any {
		return {
			id: this.id,
			storeName: this.storeName,
			// stockList: this.stockList.toPlainObject(), // We do not save stocklist, it is grabbed from database
			items: this.items.toPlainObject(), // Convert items to plain object
			restockTime: this.restockTime,
		};
	} 

	/**
	 * @returns the storeId of the store.
	 */
	getStoreId(): number {
		return this.id;
	}

	/**
	 * @returns the display name of the store.
	 */
	getStoreName(): string {
		return this.storeName;
	}

	/**
	 * @returns the cost multiplier of the store, as a float.
	 */
	getBuyMultiplier(): number {
		return this.buyMultiplier;
	}

	/**
	 * @multiplier the new multiplier
	 */
	setBuyMultiplier(multiplier: number): void {
		this.buyMultiplier = multiplier;
	}

	/**
	 * @returns the cost multiplier of the store, as a float.
	 */
	getSellMultiplier(): number {
		return this.sellMultiplier;
	}

	/**
	 * @multiplier the new multiplier
	 */
	setSellMultiplier(multiplier: number): void {
		this.sellMultiplier = multiplier;
	}

	/**
	 * @returns the cost multiplier of the store, as a float.
	 */
	getUpgradeMultiplier(): number {
		return this.upgradeMultiplier;
	}

	/**
	 * @multiplier the new multiplier
	 */
	setUpgradeMultiplier(multiplier: number): void {
		this.upgradeMultiplier = multiplier;
	}

	/**
	 * @returns the stock list of the store
	 */
	getStockList(): ItemList {
		return this.stockList;
	}

	/**
	 * @stockList the stock list of the store
	 */
	setStockList(stockList: ItemList): void {
		this.stockList = stockList;
	}

	/**
	 * @returns the time the store was last restocked
	 */
	getRestockTime(): number {
		return this.restockTime;
	}

	/**
	 * @restockTime  the time the store was last restocked
	 */
	setRestockTime(restockTime: number): void {
		this.restockTime = restockTime;
	}

	/**
	 * @returns the time in milliseconds between restocks
	 */
	 getRestockInterval(): number {
		return this.restockInterval;
	}

	/**
	 * @restockInterval the time in milliseconds between restocks
	 */
	setRestockInterval(restockInterval: number): void {
		this.restockInterval = restockInterval;
	}

	// Calculate the price to buy an item from the store
	getBuyPrice(item: InventoryItem): number {
		return item.itemData.value * this.buyMultiplier;
	}
	
	// Calculate the price to sell an item to the store
	getSellPrice(item: InventoryItem): number {
		return item.itemData.value * this.sellMultiplier;
	}

	/**
     * Spends gold to add items to inventory. Fails if there is not enough gold.
	 * @inventory The inventory that is spending gold and gaining items
     * @item The item to add, identified by InventoryItem or ItemTemplate.
	 * @quantity Amount of item being purchased.
     * @returns InventoryTransactionResponse containing the following object or an error message.
	 * {finalGold: number,
	 *  storeItem: InventoryItem,
	 *  purchasedItem: InventoryItem}
     */
	 buyItemFromStore(inventory: Inventory, item: InventoryItem | ItemTemplate, quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}
		//verify store has enough quantity
		const getItemResponse = this.getItem(item);
		if (!getItemResponse.isSuccessful()) return getItemResponse;
		const toBuy = getItemResponse.payload;
		if (toBuy.quantity < quantity) {
			response.addErrorMessage(`Invalid quantity: store has ${toBuy.quantity} but buying ${quantity}`);
			return response;
		}
		//add item to inventory and remove gold
		const buyItemResponse = inventory.buyItem(toBuy, this.buyMultiplier, quantity);
		if (!buyItemResponse.isSuccessful()) return buyItemResponse;
		//remove item from store inventory
		const decreaseStockResponse = this.trashItem(toBuy, quantity);
		if (!decreaseStockResponse.isSuccessful()) return decreaseStockResponse;
		//format payload
		response.payload = {
			finalGold: buyItemResponse.payload.finalGold,
			storeItem: decreaseStockResponse.payload,
			purchasedItem: buyItemResponse.payload.purchasedItem
		}
		return response;
	 }
	
	/**
     * Sells items for gold.
	 * @inventory The inventory that is selling items and gaining gold
     * @item The item to sell, identified by InventoryItem or ItemTemplate.
	 * @quantity Amount of item being sold
     * @returns InventoryTransactionResponse containing the following object or an error message.
	 * {finalGold: number,
	 *  storeItem: InventoryItem,
	 *  soldItem: InventoryItem}
     */
 	sellItemToStore(inventory: Inventory, item: InventoryItem | ItemTemplate, quantity: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (quantity <= 0 || !Number.isInteger(quantity)) {
			response.addErrorMessage(`Invalid quantity: ${quantity}`);
			return response;
		}
		//verify inventory has enough quantity
		const getItemResponse = inventory.getItem(item);
		
		if (!getItemResponse.isSuccessful()) return getItemResponse;
		const toSell = getItemResponse.payload;
		if (toSell.quantity < quantity) {
			response.addErrorMessage(`Invalid quantity: inventory has ${toSell.quantity} but selling ${quantity}`);
			return response;
		}
		//remove item from inventory and add gold
		const sellItemResponse = inventory.sellItem(toSell, this.sellMultiplier, quantity);
		if (!sellItemResponse.isSuccessful()) return sellItemResponse;
		//add item to store inventory
		const increaseStockResponse = this.addItem(toSell, quantity);
		if (!increaseStockResponse.isSuccessful()) return increaseStockResponse;
		//format payload
		response.payload = {
			finalGold: sellItemResponse.payload.finalGold,
			storeItem: increaseStockResponse.payload,
			soldItem: sellItemResponse.payload.remainingItem
		}
		return response;
	}

	/**
	 * Removes all items from the store.
	 * @returns InventoryTransactionResponse containing the deleted itemList or an error message.
	 */
	emptyStore(): InventoryTransactionResponse {
		const response = this.deleteAll();
		return response;
	}

	/**
	 * Checks if all of the items (and quantities) are contained within this store's inventory
	 * @stockList the ItemList of items to check for
	 * @returns true/false
	 */
	needsRestock(stockList: ItemList = this.stockList): boolean {
		const currentItems = this.getAllItems();
		return stockList.getAllItems().some((element) => {
			
			const containsItemResponse = this.contains(element.itemData);
			if (!containsItemResponse.isSuccessful()) return true;
			if (containsItemResponse.payload) {
				//store contains item, check quantity
				const getItemResponse = this.getItem(element.itemData);
				if (!getItemResponse.isSuccessful()) {
					//should never occur, as we just checked contains
					return true;
				}
				const currentItem = getItemResponse.payload;
				return currentItem.getQuantity() < element.getQuantity();
			} else {
				//store does not contain item
				return true;
			}
		});
	}

	/**
	 * Adds items to the store if their quantity is lower than the quantity in the stockList.
	 * If items are added, updates the restockTime.
	 * If there is an error in the process, rolls back to original list.
	 * @stockList the list of items to restock. Defaults to the internal stocklist.
	 * @returns InventoryTransactionResponse of true or an error message.
	 */
	restockStore(stockList: ItemList = this.stockList): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (!this.needsRestock(stockList)) {
			response.addErrorMessage(`Error: Nothing to restock!`);
			return response;
		}
		let didAddItem = false;
		const currentItems = this.getAllItems();

		stockList.getAllItems().forEach((element, index) => {
			
			const containsItemResponse = this.contains(element.itemData);
			if (!containsItemResponse.isSuccessful()) return;
			if (containsItemResponse.payload) {
				//store contains item, get quantity and update
				const getItemResponse = this.getItem(element.itemData);
				if (!getItemResponse.isSuccessful()) {
					//should never occur, as we just checked contains
					response.addErrorMessage(getItemResponse.messages[0]);
				}
				const currentItem = getItemResponse.payload;
				if (currentItem.getQuantity() < element.getQuantity()) {
					//add missing quantity
					const addItemResponse = this.addItem(currentItem, element.getQuantity() - currentItem.getQuantity());
					if (!addItemResponse.isSuccessful()) {
						response.addErrorMessage(addItemResponse.messages[0]);
					} else {
						didAddItem = true;
					}
				} else {
					//already enough quantity, exit
					return;
				}
			} else {
				//store does not contain item, add new one with full quantity
				const addItemResponse = this.addItem(element, element.getQuantity());
				if (!addItemResponse.isSuccessful()) {
					response.addErrorMessage(addItemResponse.messages[0]);
				} else {
					didAddItem = true;
				}
			}
		})
		if (response.isSuccessful()) {
			response.payload = true;
		} else {
			//error, rollback
			this.items = new ItemList(currentItems);
		}
		if (didAddItem) {
			// this.restockTime = Date.now() + this.restockInterval;
		} else {
			response.addErrorMessage(`Error: Nothing to restock!`);
		}
		return response;
	}

	/**
     * Spends gold. Fails if there is not enough gold.
	 * @inventory The inventory that is spending gold
	 * @cost The amount of gold spent
     * @returns InventoryTransactionResponse containing the final gold or an error message.
     */
	buyCustomObjectFromStore(inventory: Inventory, cost: number): InventoryTransactionResponse {
		const response = new InventoryTransactionResponse();
		if (inventory.getGold() < cost) {
			response.addErrorMessage(`Error: requires ${cost} gold but has ${inventory.getGold()}`);
			return response;
		}
		const removeGoldResponse = inventory.removeGold(cost);
		if (!removeGoldResponse.isSuccessful()) return removeGoldResponse;
		response.payload = removeGoldResponse.payload;
		return response;
	}
}