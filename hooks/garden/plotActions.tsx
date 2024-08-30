import { Plot } from "@/models/garden/Plot";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { ItemSubtypes } from "@/models/items/ItemTypes";
import { PlacedItem } from "@/models/items/placedItems/PlacedItem";
import { PlantTemplate } from "@/models/items/templates/models/PlantTemplate";
import ItemHistory from "@/models/user/history/itemHistory/ItemHistory";
import { PlantHistory } from "@/models/user/history/itemHistory/PlantHistory";
import { saveGarden } from "@/utils/localStorage/garden";
import { saveInventory } from "@/utils/localStorage/inventory";
import { saveUser } from "@/utils/localStorage/user";
import { useGarden } from "../contexts/GardenContext";
import { useInventory } from "../contexts/InventoryContext";
import { useSelectedItem } from "../contexts/SelectedItemContext";
import { useUser } from "../contexts/UserContext";

//contains static onclick functions for plot components
export const usePlotActions = () => {
	const {garden, setGardenMessage } = useGarden();
	const {inventory, updateInventoryForceRefreshKey} = useInventory();
	const {user} = useUser();
	const {toggleSelectedItem} = useSelectedItem();

	/**
	 * Can only be used in an empty plot. Converts an inventoryItem seed into a plant and places it in this plot.
	 * @item the inventoryItem to convert to a placedItem
	 * @plot the plot to modify
	 * @returns the updated icon
	 */
	const plantSeed = (item: InventoryItem, plot: Plot) => {
		const helper = () => {

			if (item.itemData.subtype != ItemSubtypes.SEED.name) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			}
			const placeItemResponse = plot.placeItem(inventory, item);
			if (!placeItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon; 
			}
			updateInventoryForceRefreshKey();
			if (item.getQuantity() <= 0) {
				toggleSelectedItem(null);
			}
			saveInventory(inventory);
			saveGarden(garden);
			setGardenMessage(`Planted ${item.itemData.name}.`);
			return plot.getItem().itemData.icon;
		}
		return helper;
	}

	/**
	 * Can only be used in an empty plot. Converts an inventoryItem blueprint into a decoration and places it in this plot.
	 * @item - the inventoryItem to convert to a placedItem
	 * @plot - the plot to modify
	 * @returns the updated icon
	 */
	const placeDecoration = (item: InventoryItem, plot: Plot) => {
		const helper = () => {
			if (item.itemData.subtype != ItemSubtypes.BLUEPRINT.name) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			}
			const placeItemResponse = plot.placeItem(inventory, item);
			if (!placeItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon; 
			}
			updateInventoryForceRefreshKey();

			const placedItem = placeItemResponse.payload.newItem as PlacedItem;
			user.updateDecorationHistory(placedItem);
			if (item.getQuantity() <= 0) {
				toggleSelectedItem(null);
			}
			saveInventory(inventory);
			saveGarden(garden);
			saveUser(user);
			setGardenMessage(`Placed ${placeItemResponse.payload.newItem.itemData.name}.`);
			return plot.getItem().itemData.icon;
		}
		return helper;
	}

	/**
	 * Can only be used in a plot with a plant. Removes the plant and adds a harvestedItem to inventory.
	 * @plot the plot to modify
	 * @instantGrow if set to true, ignores grow timers and instantly harvests
	 * @returns the updated icon
	 */
	const clickPlant = (plot: Plot, instantGrow: boolean = false) => {
		const helper = () => {
			if (plot.getItem().itemData.subtype != ItemSubtypes.PLANT.name) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			}
			const xp = plot.getExpValue();
			const harvestItemResponse = plot.harvestItem(inventory, instantGrow, 1);
			if (!harvestItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			} 
			updateInventoryForceRefreshKey();

			const pickedItem = harvestItemResponse.payload.pickedItem as PlacedItem;
			user.updateHarvestHistory(pickedItem);
			user.addExp(xp);
			saveInventory(inventory);
			saveGarden(garden);
			saveUser(user);
			setGardenMessage(`Harvested ${harvestItemResponse.payload.pickedItem.itemData.name}.`);
			return plot.getItem().itemData.icon;
		}
		return helper;
	}

	/**
	 * Can only be used in a plot with a decoration. Removes the decoration and adds a blueprint to inventory.
	 * @plot the plot to modify
	 * @returns the updated icon
	 */
	const clickDecoration = (plot: Plot) => {
		const helper = () => {
			if (plot.getItem().itemData.subtype != ItemSubtypes.DECORATION.name) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			}
			const pickupItemResponse = plot.pickupItem(inventory);
			if (!pickupItemResponse.isSuccessful()) {
				setGardenMessage(` `);
				return plot.getItem().itemData.icon;
			}
			updateInventoryForceRefreshKey();
			saveInventory(inventory);
			saveGarden(garden);
			setGardenMessage(`Picked up ${pickupItemResponse.payload.pickedItem.itemData.name}.`);
			return plot.getItem().itemData.icon;
		}
		return helper;
	}

	const doNothing = (plot: Plot) => {
		const helper = () => {
			setGardenMessage(` `);
			return plot.getItem().itemData.icon;
		}
		return helper;
	}

	return {
		plantSeed,
		placeDecoration,
		clickPlant,
		clickDecoration,
		doNothing
	}

}