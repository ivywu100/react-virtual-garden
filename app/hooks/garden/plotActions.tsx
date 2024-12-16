import { Plot } from "@/models/garden/Plot";
import { InventoryItem, InventoryItemEntity } from "@/models/items/inventoryItems/InventoryItem";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { PlacedItem } from "@/models/items/placedItems/PlacedItem";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { loadGarden, saveGarden } from "@/utils/localStorage/garden";
import { loadInventory, saveInventory } from "@/utils/localStorage/inventory";
import { loadUser, saveUser } from "@/utils/localStorage/user";
import { useGarden } from "../contexts/GardenContext";
import { useInventory } from "../contexts/InventoryContext";
import { useSelectedItem } from "../contexts/SelectedItemContext";
import { useUser } from "../contexts/UserContext";
import { Garden } from "@/models/garden/Garden";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import User from "@/models/user/User";
import { useDispatch } from "react-redux";
import { makeApiRequest } from "@/utils/api/api";
import { setItemQuantity } from "@/store/slices/inventoryItemSlice";

//contains static onclick functions for plot components
export const usePlotActions = () => {
	const {garden, setGardenMessage } = useGarden();
	const {inventory, updateInventoryForceRefreshKey} = useInventory();
	const {user} = useUser();
	const {toggleSelectedItem} = useSelectedItem();
	const dispatch = useDispatch();

	/**
	 * Can only be used in an empty plot. Converts an inventoryItem seed into a plant and places it in this plot.
	 * @item the inventoryItem to convert to a placedItem
	 * @plot the plot to modify
	 * @returns the updated icon
	 */
	const plantSeed = (item: InventoryItem, plot: Plot) => {
		let originalGardenObject: any;
		let originalInventoryObject: any;
		let originalIcon: string;
		const uiHelper = () => {
			originalIcon = plot.getItem().itemData.icon;
			originalGardenObject = garden.toPlainObject();
			originalInventoryObject = inventory.toPlainObject();
			// Optimistically update the local state
			const originalItem = plot.getItem();
			const placeItemResponse = plot.placeItem(inventory, item);
			if (!placeItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return {success: false, displayIcon: originalItem.itemData.icon};
			}
			// updateInventoryForceRefreshKey();
			if (item.getQuantity() <= 0) {
				toggleSelectedItem(null);
			}
			
			// Update redux store
			dispatch(setItemQuantity({ 
				inventoryItemId: item.getInventoryItemId(), 
				quantity: item.getQuantity()
			}));

			saveInventory(inventory);
			saveGarden(garden);
			setGardenMessage(`Planted ${item.itemData.name}.`);
			return {success: true, displayIcon: plot.getItem().itemData.icon};
		}

		const apiHelper = async () => {
			const originalItem = plot.getItem();
			const data = {
				inventoryId: inventory.getInventoryId(), 
				inventoryItemIdentifier: item.itemData.id
			};

			try {
				const apiRoute = `/api/user/${user.getUserId()}/garden/${garden.getGardenId()}/plot/${plot.getPlotId()}/plant`;
				const result = await makeApiRequest('PATCH', apiRoute, data, true);
				console.log('Successfully planted seed:', result);
				return {success: true, displayIcon: plot.getItem().itemData.icon};
			} catch (error) {
				console.error(error);
				// Rollback the optimistic update
				const rollbackGarden = Garden.fromPlainObject(originalGardenObject);
				if (rollbackGarden instanceof Garden) saveGarden(rollbackGarden);
				const rollbackInventory = Inventory.fromPlainObject(originalInventoryObject);
				if (rollbackInventory instanceof Inventory) saveInventory(rollbackInventory);
				// plot.rollbackItem(originalItem);
				console.warn(`There was an error planting a seed, rolled back to previous plot`);
				setGardenMessage(`There was an error! Please refresh the page!`);
				return {success: false, displayIcon: originalIcon};
			}
		}

		const toReturn = {
			uiHelper: uiHelper,
			apiHelper: apiHelper
		}
		return toReturn;
	}

	/**
	 * Can only be used in an empty plot. Converts an inventoryItem blueprint into a decoration and places it in this plot.
	 * @item - the inventoryItem to convert to a placedItem
	 * @plot - the plot to modify
	 * @returns the updated icon
	 */
	const placeDecoration = (item: InventoryItem, plot: Plot) => {
		let originalGardenObject: any;
		let originalInventoryObject: any;
		let originalIcon: string;
		const uiHelper = () => {
			originalIcon = plot.getItem().itemData.icon;
			originalGardenObject = garden.toPlainObject();
			originalInventoryObject = inventory.toPlainObject();
			// Optimistically update the local state
			const placeItemResponse = plot.placeItem(inventory, item);
			if (!placeItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return {success: false, displayIcon: originalIcon};
			}
			
			// Update redux store
			dispatch(setItemQuantity({ 
				inventoryItemId: item.getInventoryItemId(), 
				quantity: item.getQuantity()
			}));

			saveInventory(inventory);
			saveGarden(garden);
			setGardenMessage(`Placed ${item.itemData.name}.`);
			return {success: true, displayIcon: plot.getItem().itemData.icon};
		}

		const apiHelper = async () => {
			const originalItem = plot.getItem();

			const data = {
				inventoryId: inventory.getInventoryId(), 
				inventoryItemIdentifier: item.itemData.id
			};

			try {
				const apiRoute = `/api/user/${user.getUserId()}/garden/${garden.getGardenId()}/plot/${plot.getPlotId()}/place`;
				const result = await makeApiRequest('PATCH', apiRoute, data, true);
				console.log('Successfully placed decoration:', result);
				return {success: true, displayIcon: plot.getItem().itemData.icon};
			} catch (error) {
				console.error(error);
				// Rollback the optimistic update
				const rollbackGarden = Garden.fromPlainObject(originalGardenObject);
				if (rollbackGarden instanceof Garden) saveGarden(rollbackGarden);
				const rollbackInventory = Inventory.fromPlainObject(originalInventoryObject);
				if (rollbackInventory instanceof Inventory) saveInventory(rollbackInventory);
				console.warn(`There was an error placing a decoration, rolled back to previous plot`);
				setGardenMessage(`There was an error! Please refresh the page!`);
				return {success: false, displayIcon: originalIcon};
			}
		}
		
		const toReturn = {
			uiHelper: uiHelper,
			apiHelper: apiHelper
		}
		return toReturn;
	}

	/**
	 * Can only be used in a plot with a plant. Removes the plant and adds a harvestedItem to inventory.
	 * @plot the plot to modify
	 * @instantGrow if set to true, ignores grow timers and instantly harvests
	 * @returns the updated icon
	 */
	const clickPlant = (plot: Plot, instantGrow: boolean = false) => {
		let originalGardenObject: any;
		let originalInventoryObject: any;
		let originalUserObject: any;
		let originalIcon: string;
		const uiHelper = () => {
			originalIcon = plot.getItem().itemData.icon;
			originalGardenObject = garden.toPlainObject();
			originalInventoryObject = inventory.toPlainObject();
			originalUserObject = user.toPlainObject();
			// Optimistically update the local state
			// const originalItem = plot.getItem();
			const canHarvest = Plot.canHarvest(plot.getItem().itemData, plot.getPlantTime(), plot.getUsesRemaining(), Date.now());
			if (!(canHarvest || instantGrow)) {
				setGardenMessage(` `);
				return {success: false, displayIcon: originalIcon, payload: null};
			}
			const xp = plot.getExpValue();
			const harvestItemResponse = plot.harvestItem(inventory, instantGrow, 1);
			const pickedItem = harvestItemResponse.payload.pickedItem as PlacedItem;
			user.updateHarvestHistory(pickedItem);
			user.addExp(xp);			
			
			// Update redux store
			dispatch(setItemQuantity({ 
				inventoryItemId: harvestItemResponse.payload.newItem.getInventoryItemId(), 
				quantity: harvestItemResponse.payload.newItem.getQuantity()
			}));

			saveInventory(inventory);
			saveGarden(garden);
			saveUser(user);
			setGardenMessage(`Harvested ${harvestItemResponse.payload.pickedItem.itemData.name}.`);
			return {success: true, displayIcon: plot.getItem().itemData.icon, payload: harvestItemResponse.payload.newItem};
		}

		const apiHelper = async () => {
			const data = {
				inventoryId: inventory.getInventoryId(), 
				levelSystemId: user.getLevelSystem().getLevelSystemId(), 
				numHarvests: 1, // Usually only 1 harvest
				replacementItem: null, // Replace with ground as default
				instantHarvestKey: instantGrow ? 'mangomangobear' : '' // Works in dev environment only
			}
			try {
				const apiRoute = `/api/user/${user.getUserId()}/garden/${garden.getGardenId()}/plot/${plot.getPlotId()}/harvest`;
				const result: InventoryItemEntity = await makeApiRequest('PATCH', apiRoute, data, true);

				const itemTemplate = placeholderItemTemplates.getInventoryTemplate(result.identifier);
				if (!itemTemplate) {
					throw new Error(`Error parsing item template`);
				}
				const inventoryItem = inventory.getItem(itemTemplate);
				if (!(inventoryItem.isSuccessful())) {
					throw new Error(`Error finding item in inventory: ${itemTemplate.id}`);
				}
				(inventoryItem.payload as InventoryItem).setInventoryItemId(result.id);
				console.log('Successfully harvested:', result);
				return {success: true, displayIcon: plot.getItem().itemData.icon};
			} catch (error) {
				console.error(error);
				// Rollback the optimistic update
				const rollbackGarden = Garden.fromPlainObject(originalGardenObject);
				if (rollbackGarden instanceof Garden) saveGarden(rollbackGarden);
				const rollbackInventory = Inventory.fromPlainObject(originalInventoryObject);
				if (rollbackInventory instanceof Inventory) saveInventory(rollbackInventory);
				const rollbackUser = User.fromPlainObject(originalUserObject);
				if (rollbackUser instanceof User) saveUser(rollbackUser);
				console.warn(`There was an error clicking a plant, rolled back`);
				setGardenMessage(`There was an error! Please refresh the page!`);
				return {success: false, displayIcon: originalIcon};
			}
		}
		
		const toReturn = {
			uiHelper: uiHelper,
			apiHelper: apiHelper
		}
		return toReturn;
	}

	/**
	 * Can only be used in a plot with a decoration. Removes the decoration and adds a blueprint to inventory.
	 * @plot the plot to modify
	 * @returns the updated icon
	 */
	const clickDecoration = (plot: Plot) => {
		let originalGardenObject: any;
		let originalInventoryObject: any;
		let originalIcon: string;
		const uiHelper = () => {
			originalIcon = plot.getItem().itemData.icon;
			originalGardenObject = garden.toPlainObject();
			originalInventoryObject = inventory.toPlainObject();
			// Optimistically update the local state
			// const originalItem = plot.getItem();
			if (plot.getItem().itemData.subtype != ItemSubtypes.DECORATION.name) {
				setGardenMessage(` `);
				return {success: false, displayIcon: originalIcon};
			}
			const pickupItemResponse = plot.pickupItem(inventory);
			const pickedItem = pickupItemResponse.payload.pickedItem as PlacedItem;
			const xp = plot.getExpValue();
			user.updateHarvestHistory(pickedItem);
			user.addExp(xp);		
			
			// Update redux store
			dispatch(setItemQuantity({ 
				inventoryItemId: pickupItemResponse.payload.newItem.getInventoryItemId(), 
				quantity: pickupItemResponse.payload.newItem.getQuantity()
			}));
			
			saveInventory(inventory);
			saveGarden(garden);
			saveUser(user);
			setGardenMessage(`Picked up ${pickupItemResponse.payload.pickedItem.itemData.name}.`);
			return {success: true, displayIcon: plot.getItem().itemData.icon};
		}

		const apiHelper = async () => {
			const data = {
				inventoryId: inventory.getInventoryId(), 
				replacementItem: null, // Replace with ground as default
			}
			try {
				const apiRoute = `/api/user/${user.getUserId()}/garden/${garden.getGardenId()}/plot/${plot.getPlotId()}/pickup`;
				const result: InventoryItemEntity = await makeApiRequest('PATCH', apiRoute, data, true);
				
				const itemTemplate = placeholderItemTemplates.getInventoryTemplate(result.identifier);
				if (!itemTemplate) {
					throw new Error(`Error parsing item template`);
				}
				const inventoryItem = inventory.getItem(itemTemplate);
				if (!(inventoryItem.isSuccessful())) {
					throw new Error(`Error finding item in inventory`)
				}
				(inventoryItem.payload as InventoryItem).setInventoryItemId(result.id);
				console.log('Successfully picked up decoration:', result);
				return {success: true, displayIcon: plot.getItem().itemData.icon};
			} catch (error) {
				console.error(error);
				// Rollback the optimistic update
				const rollbackGarden = Garden.fromPlainObject(originalGardenObject);
				if (rollbackGarden instanceof Garden) saveGarden(rollbackGarden);
				const rollbackInventory = Inventory.fromPlainObject(originalInventoryObject);
				if (rollbackInventory instanceof Inventory) saveInventory(rollbackInventory);
				console.warn(`There was an error clicking a decoration, rolled back`);
				setGardenMessage(`There was an error! Please refresh the page!`);
				return {success: false, displayIcon: originalIcon};
			}
		}
		
		const toReturn = {
			uiHelper: uiHelper,
			apiHelper: apiHelper
		}
		return toReturn;
	}

	const doNothing = (plot: Plot) => {
		const uiHelper = () => {
			setGardenMessage(` `);
			return {success: true, displayIcon: plot.getItem().itemData.icon};
		}

		const apiHelper = async () => {
			setGardenMessage(` `);
			return {success: true, displayIcon: plot.getItem().itemData.icon};
		}
		
		const toReturn = {
			uiHelper: uiHelper,
			apiHelper: apiHelper
		}
		return toReturn;
	}

	return {
		plantSeed,
		placeDecoration,
		clickPlant,
		clickDecoration,
		doNothing
	}

}
