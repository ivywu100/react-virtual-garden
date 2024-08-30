import ItemStoreComponent from "@/components/itemStore/itemStore";
import { triggerAsyncId } from "async_hooks";
import { ItemSubtypes } from "../items/ItemTypes";
import { PlacedItem } from "../items/placedItems/PlacedItem";
import { DecorationTemplate } from "../items/templates/models/DecorationTemplate";
import { placeholderItemTemplates } from "../items/templates/models/PlaceholderItemTemplate";
import { PlantTemplate } from "../items/templates/models/PlantTemplate";
import LevelSystem from "../level/LevelSystem";
import { BooleanResponse } from "../utility/BooleanResponse";
import { actionHistoryFactory } from "./history/actionHistory/ActionHistoryFactory";
import { actionHistoryRepository } from "./history/actionHistory/ActionHistoryRepository";
import { ActionHistoryList } from "./history/ActionHistoryList";
import { DecorationHistory } from "./history/itemHistory/DecorationHistory";
import ItemHistory from "./history/itemHistory/ItemHistory";
import { PlantHistory } from "./history/itemHistory/PlantHistory";
import { ItemHistoryList } from "./history/ItemHistoryList";
import Icon from "./icons/Icon";

class User {

	private username: string;
	private icon: string; //indexes into a list of icons by name
	private level: LevelSystem;
	private itemHistory: ItemHistoryList;
	private actionHistory: ActionHistoryList;

	constructor(username: string, icon: string, level: LevelSystem = new LevelSystem(), itemHistory: ItemHistoryList = new ItemHistoryList, actionHistory: ActionHistoryList = new ActionHistoryList()) {
		this.username = username;
		this.icon = icon;
		this.level = level;
		this.itemHistory = itemHistory;
		this.actionHistory = actionHistory;
	}

	static fromPlainObject(plainObject: any) {
		try {
            // Validate plainObject structure
            if (!plainObject || typeof plainObject !== 'object') {
                throw new Error('Invalid plainObject structure for User');
            }
			const { username, icon, level, itemHistory, actionHistory } = plainObject;
			// Perform additional type checks if necessary
			if (typeof username !== 'string') {
				throw new Error('Invalid username property in plainObject for User');
			}
			if (typeof icon !== 'string') {
				throw new Error('Invalid icon property in plainObject for User');
			}
			const hydratedLevel = LevelSystem.fromPlainObject(level);
			const hydratedItemHistory = ItemHistoryList.fromPlainObject(itemHistory);
			const hydratedActionHistory = ActionHistoryList.fromPlainObject(actionHistory);
			return new User(username, icon, hydratedLevel, hydratedItemHistory, hydratedActionHistory);
			
		} catch (err) {
			console.error('Error creating User from plainObject:', err);
            return new User("Error User", "error");
		}
	}

	toPlainObject(): any {
		return {
			username: this.username,
			icon: this.icon,
			level: this.level.toPlainObject(),
			itemHistory: this.itemHistory.toPlainObject(),
			actionHistory: this.actionHistory.toPlainObject(),
		};
	}

	getUsername(): string {
		return this.username;
	}

	setUsername(newUsername: string): void {
		this.username = newUsername;
	}

	getIcon(): string {
		return this.icon;
	}

	setIcon(newIcon: string): void {
		this.icon = newIcon;
	}

	getItemHistory() {
		return this.itemHistory;
	}

	getActionHistory() {
		return this.actionHistory;
	}

	/**
	 * @returns the level of the user
	 */
	 getLevel(): number {
		return this.level.getLevel();
	}

	/**
	 * @returns the total xp needed to level up
	 */
	getExpToLevelUp(): number {
		return this.level.getExpToLevelUp();
	}

	/**
	 * @returns the user's current xp
	 */
	getCurrentExp(): number {
		return this.level.getCurrentExp();
	}

	/**
	 * @returns the growth rate, higher = faster
	 */
	getGrowthRate(): number {
		return this.level.getGrowthRate();
	}

	/**
	 * @exp the quantity of xp to add
	 */
	addExp(exp: number) {
		return this.level.addExperience(exp);
	}

	/**
	 * Updates this user's itemHistory and actionHistory following the harvest of a plant.
	 * @item the item that was harvested
	 * @returns Response containing true or an error message on failure
	 */
	updateHarvestHistory(plantItem: PlacedItem): BooleanResponse {
		const response = new BooleanResponse();
		if (plantItem.itemData.subtype !== ItemSubtypes.PLANT.name) {
			response.addErrorMessage(`Error updating history: attempting to harvest item of type ${plantItem.itemData.subtype}`);
			return response;
		}
		const itemHistory = new PlantHistory(plantItem.itemData as PlantTemplate, 1);
		this.itemHistory.addItemHistory(itemHistory);
		const harvestAllHistory = actionHistoryFactory.createActionHistoryByIdentifiers(plantItem.itemData.subtype, 'all', 'harvested', 1);
		const harvestCategoryHistory = actionHistoryFactory.createActionHistoryByIdentifiers(plantItem.itemData.subtype, plantItem.itemData.category, 'harvested', 1);
		if (harvestAllHistory) {
			this.actionHistory.addActionHistory(harvestAllHistory);
			response.payload = true;
		} else {
			//probably impossible to reach, would only occur if allHistory doesn't exist, which requires modification of histories.json
			response.addErrorMessage(`Error updating history: could not find all action history`);
		}

		if (harvestCategoryHistory) {
			this.actionHistory.addActionHistory(harvestCategoryHistory);
			response.payload = true;
		} else {
			response.addErrorMessage(`Error updating history: could not find action history for item ${plantItem.itemData.name}`);
		}
		
		return response;
	}

	/**
	 * Updates this user's itemHistory and actionHistory following the harvest of an item.
	 * @item the item that was harvested
	 * @returns Response containing true or an error message on failure
	 */
	 updateDecorationHistory(decorationItem: PlacedItem): BooleanResponse {
		const response = new BooleanResponse();
		if (decorationItem.itemData.subtype !== ItemSubtypes.DECORATION.name) {
			response.addErrorMessage(`Error updating history: attempting to place item of type ${decorationItem.itemData.subtype}`);
			return response;
		}
		const itemHistory = new DecorationHistory(decorationItem.itemData as DecorationTemplate, 1);
		this.itemHistory.addItemHistory(itemHistory);
		// const harvestAllHistory = actionHistoryFactory.createActionHistoryByIdentifiers(decorationItem.itemData.subtype, 'all', 'harvested', 1);
		const placeDecorationHistory = actionHistoryFactory.createActionHistoryByIdentifiers(decorationItem.itemData.subtype, decorationItem.itemData.category, 'placed', 1);
		// if (harvestAllHistory) {
		// 	this.actionHistory.addActionHistory(harvestAllHistory);
		// 	response.payload = true;
		// } else {
		// 	//probably impossible to reach, would only occur if allHistory doesn't exist, which requires modification of histories.json
		// 	response.addErrorMessage(`Error updating history: could not find all action history`);
		// }

		if (placeDecorationHistory) {
			this.actionHistory.addActionHistory(placeDecorationHistory);
			response.payload = true;
		} else {
			response.addErrorMessage(`Error updating history: could not find action history for item ${decorationItem.itemData.name}`);
		}
		
		return response;
	}

	isIconUnlocked(iconOption: Icon) {
		if (iconOption.getName() === 'apple' || iconOption.getName() === 'blueprint') return true;
		const template = placeholderItemTemplates.getPlacedItemTemplateByName(iconOption.getName());
		if (!template) return false;
		const itemAvailable = this.getItemHistory().contains(template);
		if (itemAvailable.payload) {
			return true;
		}
		return false;
	}
}
export default User;